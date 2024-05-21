import { FastifyBaseLogger, FastifyRequest } from "fastify";
import { createError } from "@fastify/error";
import {
  CsvRecord,
  ImportChannel,
  ImportStatus,
  ToImportUser,
  UsersImport,
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

export const importCsvFromRequest = async (params: {
  req: FastifyRequest;
  pool: Pool;
}): Promise<void> => {
  const usersToImport = await extractUsersFromRequest(params.req);

  if (usersToImport.length === 0) {
    throw new Error("Files must have at least one user");
  }

  await processUserImport({
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

  await processUserImport({
    pool: params.pool,
    logger: params.logger,
    toImportUsers,
    channel: "api",
  });
};

const insertToImportUsers = async (params: {
  pool: Pool;
  logger: FastifyBaseLogger;
  toImportUsers: ToImportUser[];
  channel: ImportChannel;
}): Promise<string> => {
  const client = await params.pool.connect();
  try {
    // for now the organisation id is randomic, we have
    // to decide where to store that value in relation to the
    // user
    const result = await client.query<{ import_id: string }>(
      `
        insert into users_imports(
            organisation_id,
            users_data,
            import_channel)
         values ($1, $2, $3) RETURNING import_id
    `,
      [organisationId, JSON.stringify(params.toImportUsers), params.channel],
    );

    return result.rows[0].import_id;
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

const processUserImport = async (params: {
  pool: Pool;
  logger: FastifyBaseLogger;
  toImportUsers: ToImportUser[];
  channel: ImportChannel;
}): Promise<void> => {
  // insert a transaction that includes everything
  const importId = await insertToImportUsers(params);

  if (process.env.SYNCHRONOUS_USER_IMPORT ?? 0) {
    await mapUsers({ logger: params.logger, pool: params.pool, importId });
    return;
  }

  await mapUsersAsync(importId);
};

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
const mapUsersAsync = async (_importId: string) => {
  throw new Error("Not implemented yet");
};

const mapUsers = async (params: {
  importId: string;
  pool: Pool;
  logger: FastifyBaseLogger;
}) => {
  const userImport = await getUsersImport(params);

  console.log({ userImport });
};

const getUsersImport = async (params: {
  importId: string;
  pool: Pool;
  logger: FastifyBaseLogger;
}): Promise<UsersImport> => {
  const client = await params.pool.connect();
  try {
    // for now the organisation id is randomic, we have
    // to decide where to store that value in relation to the
    // user
    const result = await client.query<UsersImport>(
      `
        select 
          organisation_id as "organisationId",
          imported_at as "importedAt",
          users_data as "usersData",
          import_channel as "importChannel",
          retry_count as "retryCount",
          last_retry_at as "lastRetryAt",
          import_id as "importId"
        from users_imports where import_id = $1
    `,
      [params.importId],
    );
    if (!result.rowCount) {
      throw new Error("Import id not found");
    }
    return result.rows[0];
  } catch (error) {
    const toOutput = createError(
      "SERVER_ERROR",
      `Error during gettings users import from db: ${(error as Error).message}`,
      500,
    )();
    params.logger.error({ error: toOutput });
    throw toOutput;
  } finally {
    client.release;
  }
};
