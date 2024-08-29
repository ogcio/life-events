import { Static, TSchema, Type } from "@sinclair/typebox";

export const Token = Type.Object({
  id_token: Type.String(),
  token_type: Type.String(),
  not_before: Type.Number(),
  id_token_expires_in: Type.Number(),
  profile_info: Type.String(),
  scope: Type.String(),
});

export type TokenType = Static<typeof Token>;

const FileOwner = Type.Object({
  id: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
  ppsn: Type.String(),
  email: Type.Optional(Type.String()),
  phone: Type.Optional(Type.String()),
});

export type FileOwnerType = Static<typeof FileOwner>;

export const ResponseMetadata = Type.Object({
  fileName: Type.String(),
  id: Type.Optional(Type.String()),
  key: Type.String(),
  owner: Type.Optional(FileOwner),
  fileSize: Type.Number(),
  mimeType: Type.String(),
  createdAt: Type.String(),
  lastScan: Type.String(),
  deleted: Type.Optional(Type.Boolean({ default: false })),
  infected: Type.Boolean(),
  infectionDescription: Type.Optional(Type.String()),
  antivirusDbVersion: Type.Optional(Type.String()),
  sharedWith: Type.Optional(Type.Array(FileOwner)),
});

export type ResponseMetadataType = Static<typeof ResponseMetadata>;

export const getGenericResponseSchema = <T extends TSchema>(dataType: T) =>
  Type.Object({
    data: dataType,
  });

export const FileMetadata = Type.Object({
  fileName: Type.String(),
  id: Type.Optional(Type.String()),
  key: Type.String(),
  ownerId: Type.String(),
  fileSize: Type.Number(),
  mimeType: Type.String(),
  createdAt: Type.Date(),
  lastScan: Type.Date(),
  deleted: Type.Optional(Type.Boolean({ default: false })),
  infected: Type.Boolean(),
  infectionDescription: Type.Optional(Type.String()),
  antivirusDbVersion: Type.Optional(Type.String()),
  organizationId: Type.String(),
});

export type Sharing = {
  fileId: string;
  userId: string;
};

export type FileMetadataType = Static<typeof FileMetadata>;
