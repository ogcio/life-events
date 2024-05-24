import { Static, Type } from "@sinclair/typebox";

export const InvitationStatusUnionType = Type.Union(
  [
    Type.Literal("to_be_invited"),
    Type.Literal("pending"),
    Type.Literal("accepted"),
    Type.Literal("declined"),
  ],
  { default: Type.Literal("pending") },
);
export type InvitationStatus = Static<typeof InvitationStatusUnionType>;

export const UserStatusUnionType = Type.Union(
  [
    Type.Literal("to_be_invited"),
    Type.Literal("pending"),
    Type.Literal("disabled"),
    Type.Literal("active"),
  ],
  { default: Type.Literal("pending") },
);
export type UserStatus = Static<typeof UserStatusUnionType>;

export const ImportChannelUnionType = Type.Union(
  [Type.Literal("api"), Type.Literal("csv")],
  { default: Type.Literal("api") },
);
export type ImportChannel = Static<typeof ImportChannelUnionType>;

export const ImportStatusUnionType = Type.Union(
  [
    Type.Literal("pending"),
    Type.Literal("imported"),
    Type.Literal("not_found"),
    Type.Literal("error"),
  ],
  { default: Type.Literal("pending") },
);
export type ImportStatus = Static<typeof ImportStatusUnionType>;

export const CorrelationQualityUnionType = Type.Union([
  Type.Literal("full"),
  Type.Literal("partial"),
]);
export type CorrelationQuality = Static<typeof CorrelationQualityUnionType>;

const NullableStringType = Type.Union([Type.Null(), Type.String()], {
  default: Type.Null(),
});

export const UserSchema = Type.Object({
  id: Type.Optional(Type.String()),
  userProfileId: NullableStringType,
  importerOrganisationId: Type.String(),
  userStatus: UserStatusUnionType,
  correlationQuality: CorrelationQualityUnionType,
});

export type User = Static<typeof UserSchema>;

export const OrganisationUserConfigSchema = Type.Object({
  organisationId: Type.String(),
  userId: Type.String(),
  invitationStatus: InvitationStatusUnionType,
  invitationSentAt: NullableStringType,
  invitationFeedbackAt: NullableStringType,
  preferredTransports: Type.Array(Type.String()),
});

export type OrganisationUserConfig = Static<
  typeof OrganisationUserConfigSchema
>;

export const ToImportUserSchema = Type.Object({
  importIndex: Type.Integer(),
  publicIdentityId: NullableStringType,
  firstName: NullableStringType,
  lastName: NullableStringType,
  phoneNumber: NullableStringType,
  birthDate: NullableStringType,
  emailAddress: NullableStringType,
  address: Type.Union(
    [
      Type.Object({
        city: NullableStringType,
        zipCode: NullableStringType,
        street: NullableStringType,
        country: NullableStringType,
        region: NullableStringType,
      }),
      Type.Null(),
    ],
    { default: Type.Null() },
  ),
  importStatus: ImportStatusUnionType,
  importError: Type.Optional(NullableStringType),
  relatedUserProfileId: Type.Optional(NullableStringType),
});

export type ToImportUser = Static<typeof ToImportUserSchema>;

export const UsersImportSchema = Type.Object({
  organisationId: Type.String(),
  importedAt: Type.String(),
  usersData: Type.Array(ToImportUserSchema),
  importChannel: ImportChannelUnionType,
  retryCount: Type.Integer({ default: 0 }),
  lastRetryAt: NullableStringType,
  importId: Type.String(),
});

export type UsersImport = Static<typeof UsersImportSchema>;

const NullableOptionalStringType = Type.Optional(NullableStringType);

export const CsvRecordSchema = Type.Object({
  importIndex: Type.Integer(),
  publicIdentityId: NullableOptionalStringType,
  firstName: NullableOptionalStringType,
  lastName: NullableOptionalStringType,
  phoneNumber: NullableOptionalStringType,
  birthDate: NullableOptionalStringType,
  emailAddress: NullableOptionalStringType,
  addressCity: NullableOptionalStringType,
  addressZipCode: NullableOptionalStringType,
  addressStreet: NullableOptionalStringType,
  addressCountry: NullableOptionalStringType,
  addressRegion: NullableOptionalStringType,
});

export type CsvRecord = Static<typeof CsvRecordSchema>;

export const UserInvitationSchema = Type.Object({
  id: Type.String(),
  userProfileId: Type.String(),
  organisationId: Type.String(),
  organisationInvitationStatus: InvitationStatusUnionType,
  organisationInvitationSentAt: Type.Optional(Type.String()),
  organisationInvitationFeedbackAt: Type.Optional(Type.String()),
  organisationPreferredTransports: Type.Optional(Type.Array(Type.String())),
  correlationQuality: CorrelationQualityUnionType,
  userStatus: UserStatusUnionType,
});

export type UserInvitation = Static<typeof UserInvitationSchema>;
