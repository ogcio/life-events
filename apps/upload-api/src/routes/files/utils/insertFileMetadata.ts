import { FastifyInstance } from "fastify";

type FileMetadata = {
  filename: string;
  key: string;
  owner: string;
  fileSize: number;
  mimetype: string;
  createdAt: Date;
  lastScan: Date;
  infected: boolean;
  infectionDescription: string | null;
};

export default async (app: FastifyInstance, metadata: FileMetadata) => {
  const {
    filename,
    createdAt,
    fileSize,
    infectionDescription,
    key,
    lastScan,
    mimetype,
    infected,
    owner,
  } = metadata;

  await app.pg.query(
    `
      INSERT INTO files (
        key, owner, fileSize, mimetype, createdAt, lastScan, infected, infection_description, filename
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9
          )
          RETURNING *;
          `,
    [
      key,
      owner,
      fileSize,
      mimetype,
      createdAt,
      lastScan,
      infected,
      infectionDescription,
      filename,
    ],
  );
};
