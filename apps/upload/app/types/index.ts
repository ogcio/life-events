export type FileMetadata = {
  filename: string;
  id?: string;
  key: string;
  owner: string;
  fileSize: number;
  mimetype: string;
  createdAt: string;
  lastScan: string;
  deleted?: boolean;
  infected: boolean;
  infectionDescription?: string;
};
