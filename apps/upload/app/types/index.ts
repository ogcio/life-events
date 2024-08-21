type FileOwner = {
  id: string;
  firstName: string;
  lastName: string;
  ppsn: string;
  email?: string;
  phone?: string;
};

export type FileMetadata = {
  filename: string;
  id?: string;
  key: string;
  owner: FileOwner;
  fileSize: number;
  mimetype: string;
  createdAt: string;
  lastScan: string;
  deleted?: boolean;
  infected: boolean;
  infectionDescription?: string;
};
