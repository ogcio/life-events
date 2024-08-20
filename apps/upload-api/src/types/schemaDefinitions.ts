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

export const ResponseMetadata = Type.Object({
  filename: Type.String(),
  id: Type.Optional(Type.String()),
  key: Type.String(),
  owner: Type.String(),
  fileSize: Type.Number(),
  mimetype: Type.String(),
  createdAt: Type.String(),
  lastScan: Type.String(),
  deleted: Type.Optional(Type.Boolean({ default: false })),
  infected: Type.Boolean(),
  infectionDescription: Type.Optional(Type.String()),
  antivirusDbVersion: Type.Optional(Type.String()),
});

export type ResponseMetadataType = Static<typeof ResponseMetadata>;

export const getGenericResponseSchema = <T extends TSchema>(dataType: T) =>
  Type.Object({
    data: dataType,
  });

export const FileMetadata = Type.Object({
  filename: Type.String(),
  id: Type.Optional(Type.String()),
  key: Type.String(),
  owner: Type.String(),
  fileSize: Type.Number(),
  mimetype: Type.String(),
  createdAt: Type.Date(),
  lastScan: Type.Date(),
  deleted: Type.Optional(Type.Boolean({ default: false })),
  infected: Type.Boolean(),
  infectionDescription: Type.Optional(Type.String()),
  antivirusDbVersion: Type.Optional(Type.String()),
  organizationId: Type.String(),
});

export type FileMetadataType = Static<typeof FileMetadata>;
