import { FastifyRequest } from "fastify";
import { createError } from "@fastify/error";
import { CsvRecord, ToImportUser } from "../../types/usersSchemaDefinitions";
import "@fastify/multipart";
import * as csv from "fast-csv";
import { Pool } from "pg";
import { organisationId } from "../../utils";

const normalizeValue = (value: string | undefined | null): string | null =>
  typeof value === "string" && value.length > 0 ? value : null;

export const getUsersFromCsv = async (
  filePath: string,
): Promise<ToImportUser[]> => {
  const records: ToImportUser[] = [];
  const parser = csv
    .parseFile<CsvRecord, ToImportUser>(filePath, { headers: true })
    .transform(
      (row: CsvRecord): ToImportUser => ({
        importIndex: Number(row.importIndex),
        publicIdentityId: normalizeValue(row.publicIdentityId),
        firstName: normalizeValue(row.firstName),
        lastName: normalizeValue(row.lastName),
        phoneNumber: normalizeValue(row.phoneNumber),
        birthDate: normalizeValue(row.birthDate),
        emailAddress: normalizeValue(row.emailAddress),
        address: {
          city: normalizeValue(row.addressCity),
          country: normalizeValue(row.addressCountry),
          region: normalizeValue(row.addressRegion),
          zipCode: normalizeValue(row.addressZipCode),
          street: normalizeValue(row.addressStreet),
        },
        importStatus: "pending",
      }),
    );

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

  const client = await params.pool.connect();
  try {
    await client.query(
      `
        insert into users_imports(
            organisation_id,
            users_data,
            import_channel
         values ($1, $2, $3)
    `,
      [organisationId, JSON.stringify(usersToImport), "csv"],
    );
  } catch (error) {
    const toOutput = createError(
      "SERVER_ERROR",
      `Error during CSV file store on db: ${(error as Error).message}`,
      500,
    )();
    params.req.log.error({ error: toOutput });
    throw toOutput;
  } finally {
    client.release;
  }
};
