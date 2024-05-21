import { FastifyBaseLogger, FastifyRequest } from "fastify";
import { createError } from "@fastify/error";
import {
  CsvRecord,
  ImportChannel,
  ImportStatus,
  ToImportUser,
} from "../../types/usersSchemaDefinitions";
import "@fastify/multipart";
import { parseFile, writeToBuffer } from "fast-csv";
import { Pool } from "pg";
import { organisationId } from "../../utils";

const getMockCsvRecord = (): CsvRecord => ({
  importIndex: 1,
  publicIdentityId: "PUBLIC_IDENTITY_ID",
  firstName: "First",
  lastName: "Surname",
  phoneNumber: "+313124532112",
  birthDate: "01/01/1990",
  emailAddress: "stub@email.address.com",
  addressCity: "City",
  addressZipCode: "00000",
  addressStreet: "Long Street 123",
  addressCountry: "Country",
  addressRegion: "Region",
});

const normalizeValue = (value: string | undefined | null): string | null =>
  typeof value === "string" && value.length > 0 ? value : null;

const csvRecordToToImportUser = (
  toMap: CsvRecord,
  importStatus: ImportStatus = "pending",
): ToImportUser => ({
  importIndex: Number(toMap.importIndex),
  publicIdentityId: normalizeValue(toMap.publicIdentityId),
  firstName: normalizeValue(toMap.firstName),
  lastName: normalizeValue(toMap.lastName),
  phoneNumber: normalizeValue(toMap.phoneNumber),
  birthDate: normalizeValue(toMap.birthDate),
  emailAddress: normalizeValue(toMap.emailAddress),
  address: {
    city: normalizeValue(toMap.addressCity),
    country: normalizeValue(toMap.addressCountry),
    region: normalizeValue(toMap.addressRegion),
    zipCode: normalizeValue(toMap.addressZipCode),
    street: normalizeValue(toMap.addressStreet),
  },
  importStatus: importStatus,
});

export const getUsersFromCsv = async (
  filePath: string,
): Promise<ToImportUser[]> => {
  const records: ToImportUser[] = [];
  const parser = parseFile<CsvRecord, ToImportUser>(filePath, {
    headers: true,
  }).transform((row: CsvRecord): ToImportUser => csvRecordToToImportUser(row));

  for await (const row of parser) {
    records.push(row);
  }

  return records;
};

const extractUsersFromRequest = async (
  req: FastifyRequest,
): Promise<ToImportUser[]> => {
  const file = await req.files();
  if (!file) {
    throw new Error("file is missing");
  }

  const savedFiles = await req.saveRequestFiles();

  return getUsersFromCsv(savedFiles[0].filepath);
};

const insertToImportUsers = async (params: {
  pool: Pool;
  logger: FastifyBaseLogger;
  toImportUsers: ToImportUser[];
  channel: ImportChannel;
}): Promise<void> => {
  const client = await params.pool.connect();
  try {
    // for now the organisation id is randomic, we have
    // to decide where to store that value in relation to the
    // user
    await client.query(
      `
        insert into users_imports(
            organisation_id,
            users_data,
            import_channel)
         values ($1, $2, $3)
    `,
      [organisationId, JSON.stringify(params.toImportUsers), params.channel],
    );
  } catch (error) {
    const toOutput = createError(
      "SERVER_ERROR",
      `Error during CSV file store on db: ${(error as Error).message}`,
      500,
    )();
    params.logger.error({ error: toOutput });
    throw toOutput;
  } finally {
    client.release;
  }
};

export const importCsvFromRequest = async (params: {
  req: FastifyRequest;
  pool: Pool;
}): Promise<void> => {
  const usersToImport = await extractUsersFromRequest(params.req);

  if (usersToImport.length === 0) {
    throw new Error("Files must have at least one user");
  }

  await insertToImportUsers({
    pool: params.pool,
    logger: params.req.log,
    toImportUsers: usersToImport,
    channel: "csv",
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getCsvExample = (): Promise<Buffer> =>
  writeToBuffer([getMockCsvRecord()], {
    headers: true,
    alwaysWriteHeaders: true,
  });

export const importCsvRecords = async (params: {
  pool: Pool;
  logger: FastifyBaseLogger;
  csvRecords: CsvRecord[];
}): Promise<void> => {
  const toImportUsers: ToImportUser[] = params.csvRecords.map((record) =>
    csvRecordToToImportUser(record),
  );

  await insertToImportUsers({
    pool: params.pool,
    logger: params.logger,
    toImportUsers,
    channel: "api",
  });
};
