import { FastifyInstance } from "fastify";

type FileMetadata = {
  filename: string;
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

export default async (app: FastifyInstance, fileId: string, owner: string) => {
  return await app.pg.query<FileMetadata>(
    `SELECT id, key, owner, fileSize as "fileSize", mimetype, createdAt as "createdAt", lastScan as "lastScan", infected, infection_description, filename FROM files
  WHERE id = $1 AND owner = $2`,
    [fileId, owner],
  );
};
