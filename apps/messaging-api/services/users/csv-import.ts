import { FastifyRequest } from "fastify";
import { CsvRecord, ToImportUser } from "../../types/usersSchemaDefinitions";
import "@fastify/multipart";
import fs from "fs";
import * as csv from "fast-csv";

export const getUsersFromCsv = async (filePath: string) => {
  const records = [];
  const parser = fs
    .createReadStream(filePath)
    .pipe(csv.parse({ headers: true }))
    // pipe the parsed input into a csv formatter
    .pipe(csv.format<CsvRecord, ToImportUser>({ headers: true }))
    // Using the transform function from the formatting stream
    .transform((row, next): void => {
      return next(null, {
        importIndex: row.importIndex,
        publicIdentityId: row.publicIdentityId ?? null,
        firstName: row.firstName ?? null,
        lastName: row.lastName ?? null,
        phoneNumber: row.phoneNumber ?? null,
        birthDate: row.birthDate ?? null,
        emailAddress: row.emailAddress ?? null,
        address: {
          city: row.addressCity ?? null,
          country: row.addressCountry ?? null,
          region: row.addressRegion ?? null,
          zipCode: row.addressZipCode ?? null,
          street: row.addressStreet ?? null,
        },
        importStatus: "pending",
      });
    });

  for await (const record of parser) {
    records.push(record);
  }

  return records;
};

export const importCsvFromRequest = async (
  req: FastifyRequest,
): Promise<ToImportUser[]> => {
  const file = await req.files();
  if (!file) {
    throw new Error("file is missing");
  }

  const savedFiles = await req.saveRequestFiles();

  return getUsersFromCsv(savedFiles[0].filepath);
};
