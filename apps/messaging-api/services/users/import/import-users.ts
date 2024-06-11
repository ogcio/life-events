import { FastifyBaseLogger } from "fastify";
import { createError } from "@fastify/error";
import {
  CsvRecord,
  ImportChannel,
  ImportStatus,
  ToImportUser,
  UsersImport,
} from "../../../types/usersSchemaDefinitions";
import "@fastify/multipart";
import { parseFile, writeToBuffer } from "fast-csv";
import { Pool, PoolClient } from "pg";
import { organisationId } from "../../../utils";
import { isNativeError } from "util/types";
import { mapUsers } from "./map-users";
import { RequestUser } from "../../../plugins/auth";
import { sendInvitationsForUsersImport } from "./send-invitations";
import { PostgresDb } from "@fastify/postgres";

export const IMPORT_USERS_ERROR = "IMPORT_USERS_ERROR";
const TAGS_SEPARATOR = ";";

export const importCsvFileFromRequest = async (params: {
  user: RequestUser;
  filepath: string;
  pg: PostgresDb;
  logger: FastifyBaseLogger;
}): Promise<void> => {
  const usersToImport = await getUsersFromCsv(params.filepath);

  if (usersToImport.length === 0) {
    throw createError(
      IMPORT_USERS_ERROR,
      "Files must have at least one user",
      400,
    )();
  }

  await importUsers({
    pg: params.pg,
    logger: params.logger,
    toImportUsers: usersToImport,
    requestUser: params.user,
    channel: "csv",
  });
};

export const importCsvRecords = async (params: {
  pg: PostgresDb;
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

  await importUsers({
    pg: params.pg,
    logger: params.logger,
    toImportUsers,
    requestUser: params.requestUser,
    channel: "api",
  });
};

export const getCsvExample = (): Promise<Buffer> =>
  writeToBuffer([getMockCsvRecord()], {
    headers: true,
    alwaysWriteHeaders: true,
  });

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
  tags: "country.county.city;parent_tag.child_tag",
});

const normalizeCsvValue = (value: string | undefined | null): string | null => {
  const outputValue = typeof value === "string" ? value.trim() : null;
  if (outputValue && outputValue.length > 0) {
    return outputValue;
  }

  return null;
};

const parseTags = (toMap: CsvRecord): string[] => {
  const tagValue = normalizeCsvValue(toMap.tags);
  if (!tagValue) {
    return [];
  }

  return tagValue.toLowerCase().split(TAGS_SEPARATOR);
};

const importUsers = async (params: {
  pg: PostgresDb;
  logger: FastifyBaseLogger;
  toImportUsers: ToImportUser[];
  channel: ImportChannel;
  requestUser: RequestUser;
}): Promise<UsersImport> => {
  const importedUsers = await processUserImport({
    pool: params.pg.pool,
    logger: params.logger,
    toImportUsers: params.toImportUsers,
    channel: params.channel,
    requestUser: params.requestUser,
  });

  await sendInvitationsForUsersImport({
    pg: params.pg,
    toImportUsers: importedUsers,
    logger: params.logger,
    requestUserId: params.requestUser.id,
  });

  return importedUsers;
};

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
  tags: parseTags(toMap),
});

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
}): Promise<UsersImport> => {
  const client = await params.pool.connect();
  let importedUsers: UsersImport;
  try {
    await client.query("BEGIN");

    const importId = await insertToImportUsers({ ...params, client });
    importedUsers = await mapUsers({
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

  return importedUsers;
};

const getUsersFromCsv = async (filePath: string): Promise<ToImportUser[]> => {
  const records: ToImportUser[] = [];
  const parser = parseFile<CsvRecord, ToImportUser>(filePath, {
    headers: true,
  }).transform((row: CsvRecord): ToImportUser => csvRecordToToImportUser(row));

  for await (const row of parser) {
    records.push(row);
  }

  return records;
};
