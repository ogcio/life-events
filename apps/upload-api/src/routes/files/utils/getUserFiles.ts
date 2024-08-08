import { FastifyInstance } from "fastify";

type FileMetadata = {
  id: string;
  key: string;
  owner: string;
  fileSize: number;
  mimetype: string;
  createdAt: Date;
  lastScan: Date;
  infected: boolean;
  infectionDescription: string | null;
};

export default async (app: FastifyInstance, owner: string) => {
  return await app.pg.query<FileMetadata>(
    `SELECT id, key, owner, fileSize as "fileSize", mimetype, createdAt, lastScan, infected, infection_description FROM files
  WHERE owner = $1`,
    [owner],
  );
};
