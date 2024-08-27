type FileOwner = {
  id: string;
  firstName: string;
  lastName: string;
  ppsn: string;
  email?: string;
  phone?: string;
};

export type FileMetadata = {
  fileName: string;
  id?: string;
  key: string;
  owner?: FileOwner;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  lastScan: string;
  deleted?: boolean;
  infected: boolean;
  infectionDescription?: string;
};
