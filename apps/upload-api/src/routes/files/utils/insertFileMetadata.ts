import { FastifyInstance } from "fastify";
import { ServerError } from "shared-errors";

type FileMetadata = {
  key: string;
  owner: string;
  fileSize: number;
  mimetype: string;
  createdAt: Date;
  lastScan: Date;
  infected: boolean;
  infectionDescription: string | null;
};

export default async (
  app: FastifyInstance,
  tag: string,
  metadata: FileMetadata,
) => {
  const {
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
        key, owner, fileSize, mimetype, createdAt, lastScan, infected, infection_description
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8
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
    ],
  );
};
