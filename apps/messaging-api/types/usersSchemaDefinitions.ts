import { Static, Type } from "@sinclair/typebox";

const InvitationStatusUnionType = Type.Union(
  [Type.Literal("pending"), Type.Literal("accepted"), Type.Literal("declined")],
  { default: Type.Literal("pending") },
);

const UserStatusUnionType = Type.Union(
  [Type.Literal("pending"), Type.Literal("disabled"), Type.Literal("active")],
  { default: Type.Literal("pending") },
);

const ImportChannelUnionType = Type.Union(
  [Type.Literal("api"), Type.Literal("csv")],
  { default: Type.Literal("api") },
);

const ImportStatusUnionType = Type.Union(
  [
    Type.Literal("pending"),
    Type.Literal("imported"),
    Type.Literal("not_found"),
    Type.Literal("error"),
  ],
  { default: Type.Literal("pending") },
);

const CorrelationQualityUnionType = Type.Union([
  Type.Literal("full"),
  Type.Literal("partial"),
]);

const NullableStringType = Type.Union([Type.Null(), Type.String()], {
  default: Type.Null(),
});

export const UserSchema = Type.Object({
  id: Type.String(),
  userProfileId: NullableStringType,
  importerOrganisationId: Type.String(),
  userStatus: UserStatusUnionType,
  correlationQuality: CorrelationQualityUnionType,
});

export type User = Static<typeof UserSchema>;

export const OrganisationUserSchema = Type.Object({
  organisationId: Type.String(),
  userId: Type.String(),
  invitationStatus: InvitationStatusUnionType,
  invitationSentAt: NullableStringType,
  invitationFeedbackAt: NullableStringType,
  preferredTransports: Type.Array(Type.String()),
});

export type OrganisationUser = Static<typeof OrganisationUserSchema>;

const BasicToImportUserSchema = Type.Object({
  importIndex: Type.Integer(),
  publicIdentityId: NullableStringType,
  firstName: NullableStringType,
  lastName: NullableStringType,
  phoneNumber: NullableStringType,
  birthDate: NullableStringType,
  emailAddress: NullableStringType,
});

export const ToImportUserSchema = Type.Composite([
  BasicToImportUserSchema,
  Type.Object({
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
    importError: NullableStringType,
    relatedUserProfileId: NullableStringType,
  }),
]);

export type ToImportUser = Static<typeof ToImportUserSchema>;

export const UsersImportSchema = Type.Object({
  organisationId: Type.String(),
  importedAt: Type.String(),
  usersData: Type.Array(ToImportUserSchema),
  importChannel: ImportChannelUnionType,
  retryCount: Type.Integer({ default: 0 }),
  lastRetryAt: NullableStringType,
});

export type UsersImport = Static<typeof UsersImportSchema>;

export const CsvRecordSchema = Type.Composite([
  BasicToImportUserSchema,
  Type.Object({
    addressCity: NullableStringType,
    addressZipCode: NullableStringType,
    addressStreet: NullableStringType,
    addressCountry: NullableStringType,
    addressRegion: NullableStringType,
  }),
]);

export type CsvRecord = Static<typeof CsvRecordSchema>;
