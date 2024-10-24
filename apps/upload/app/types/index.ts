export type FileOwner = {
  id?: string;
  firstName: string;
  lastName: string;
  ppsn: string | null;
  email?: string;
  phone: string | null;
};

export type FileMetadata = {
  fileName: string;
  id?: string;
  key: string;
  ownerId: string;
  owner?: FileOwner;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  lastScan: string;
  deleted?: boolean;
  infected: boolean;
  infectionDescription?: string;
  sharedWith?: FileOwner[];
  expiresAt?: string;
};
