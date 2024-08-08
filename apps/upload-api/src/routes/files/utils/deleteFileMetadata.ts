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

export default async (app: FastifyInstance, fileId: string) => {
  return await app.pg.query<FileMetadata>(`DELETE FROM files WHERE ID = $1`, [
    fileId,
  ]);
};
