import { FastifyBaseLogger, FastifyRequest } from "fastify";
import { createError } from "@fastify/error";
import {
  CsvRecord,
  ImportChannel,
  ImportStatus,
  ToImportUser,
} from "../../../types/usersSchemaDefinitions";
import "@fastify/multipart";
import { parseFile, writeToBuffer } from "fast-csv";
import { Pool, PoolClient } from "pg";
import { organisationId } from "../../../utils";
import { isNativeError } from "util/types";
import { mapUsers } from "./map-users";
import { RequestUser } from "../../../plugins/auth";

export const IMPORT_USERS_ERROR = "IMPORT_USERS_ERROR";

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

export const importCsvFileFromRequest = async (params: {
  req: FastifyRequest;
  pool: Pool;
}): Promise<void> => {
  const usersToImport = await extractUsersFromMultipartRequest(params.req);

  if (usersToImport.length === 0) {
    throw new Error("Files must have at least one user");
  }

  await processUserImport({
    pool: params.pool,
    logger: params.req.log,
    toImportUsers: usersToImport,
    channel: "csv",
    requestUser: params.req.user!,
  });
};

export const getCsvExample = (): Promise<Buffer> =>
  writeToBuffer([getMockCsvRecord()], {
    headers: true,
    alwaysWriteHeaders: true,
  });

export const importCsvRecords = async (params: {
  pool: Pool;
  logger: FastifyBaseLogger;
  csvRecords: CsvRecord[];
  requestUser: RequestUser;
}): Promise<void> => {
  const toImportUsers: ToImportUser[] = params.csvRecords.map((record) =>
    csvRecordToToImportUser(record),
  );

  if (toImportUsers.length === 0) {
    throw new Error("At least one user needed");
  }

  await processUserImport({
    pool: params.pool,
    logger: params.logger,
    toImportUsers,
    channel: "api",
    requestUser: params.requestUser,
  });
};

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

const normalizeCsvValue = (value: string | undefined | null): string | null =>
  typeof value === "string" && value.length > 0 ? value : null;

const csvRecordToToImportUser = (
  toMap: CsvRecord,
  importStatus: ImportStatus = "pending",
): ToImportUser => ({
  importIndex: Number(toMap.importIndex),
  publicIdentityId: normalizeCsvValue(toMap.publicIdentityId),
  firstName: normalizeCsvValue(toMap.firstName),
  lastName: normalizeCsvValue(toMap.lastName),
  phoneNumber: normalizeCsvValue(toMap.phoneNumber),
  birthDate: normalizeCsvValue(toMap.birthDate),
  emailAddress: normalizeCsvValue(toMap.emailAddress),
  address: {
    city: normalizeCsvValue(toMap.addressCity),
    country: normalizeCsvValue(toMap.addressCountry),
    region: normalizeCsvValue(toMap.addressRegion),
    zipCode: normalizeCsvValue(toMap.addressZipCode),
    street: normalizeCsvValue(toMap.addressStreet),
  },
  importStatus: importStatus,
});

const extractUsersFromMultipartRequest = async (
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
  client: PoolClient;
  logger: FastifyBaseLogger;
  toImportUsers: ToImportUser[];
  channel: ImportChannel;
}): Promise<string> => {
  try {
    // for now the organisation id is randomic, we have
    // to decide where to store that value in relation to the
    // user
    const result = await params.client.query<{ import_id: string }>(
      `
        insert into users_imports(
            organisation_id,
            users_data,
            import_channel)
         values ($1, $2, $3) RETURNING import_id
    `,
      [organisationId, JSON.stringify(params.toImportUsers), params.channel],
    );

    if (result.rowCount === 0) {
      throw new Error("Cannot store the users_import data");
    }

    return result.rows[0].import_id;
  } catch (error) {
    const message = isNativeError(error) ? error.message : "unknown error";
    const toOutput = createError(
      IMPORT_USERS_ERROR,
      `Error during CSV file store on db: ${message}`,
      500,
    )();

    throw toOutput;
  }
};

const processUserImport = async (params: {
  pool: Pool;
  logger: FastifyBaseLogger;
  toImportUsers: ToImportUser[];
  channel: ImportChannel;
  requestUser: RequestUser;
}): Promise<void> => {
  const client = await params.pool.connect();
  try {
    await client.query("BEGIN");

    const importId = await insertToImportUsers({ ...params, client });
    await mapUsers({
      importId,
      client,
      logger: params.logger,
      requestUser: params.requestUser,
    });

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");

    throw error;
  } finally {
    client.release();
  }
};
