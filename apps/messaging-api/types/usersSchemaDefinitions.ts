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

export const OrgInvitationFeedbackStatusUnionType = Type.Union(
  [Type.Literal("accepted"), Type.Literal("declined")],
  { default: Type.Literal("accepted") },
);
export type OrgInvitationFeedbackStatus = Static<
  typeof OrgInvitationFeedbackStatusUnionType
>;

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

export const UserStatusFeedbackUnionType = Type.Union(
  [Type.Literal("disabled"), Type.Literal("active")],
  { default: Type.Literal("active") },
);
export type UserStatusFeedback = Static<typeof UserStatusFeedbackUnionType>;

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
    Type.Literal("missing_contacts"),
  ],
  { default: Type.Literal("pending") },
);
export type ImportStatus = Static<typeof ImportStatusUnionType>;

export const CorrelationQualityUnionType = Type.Union([
  Type.Literal("full"),
  Type.Literal("partial"),
  Type.Literal("not_related"),
]);
export type CorrelationQuality = Static<typeof CorrelationQualityUnionType>;

const NullableStringType = Type.Union([Type.Null(), Type.String()], {
  default: Type.Null(),
});

export const UserDetailsSchema = Type.Object({
  publicIdentityId: NullableStringType,
  firstName: NullableStringType,
  lastName: NullableStringType,
  birthDate: NullableStringType,
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
});
export type UserDetails = Static<typeof UserDetailsSchema>;

export const UserSchema = Type.Object({
  id: Type.Optional(Type.String()),
  userProfileId: NullableStringType,
  importerOrganisationId: Type.String(),
  userStatus: UserStatusUnionType,
  correlationQuality: CorrelationQualityUnionType,
  phone: NullableStringType,
  email: NullableStringType,
  details: Type.Optional(UserDetailsSchema),
  usersImportId: NullableStringType,
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

export const ToImportUserSchema = Type.Composite([
  Type.Object({
    importIndex: Type.Integer(),
    phoneNumber: NullableStringType,
    emailAddress: NullableStringType,
    importStatus: ImportStatusUnionType,
    importError: Type.Optional(NullableStringType),
    relatedUserProfileId: Type.Optional(NullableStringType),
    tags: Type.Optional(Type.Array(Type.String())),
  }),
  UserDetailsSchema,
]);
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
  tags: NullableOptionalStringType,
});
export type CsvRecord = Static<typeof CsvRecordSchema>;

export const TagSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  tagName: Type.Lowercase(Type.String()),
  tagPath: Type.Lowercase(Type.String()),
});
export type Tag = Static<typeof TagSchema>;

export const TagForUserSchema = Type.Object({
  userId: Type.String({ format: "uuid" }),
  tagId: Type.String({ format: "uuid" }),
});
export type TagForUser = Static<typeof TagForUserSchema>;

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

export const OrganisationInvitationFeedbackSchema = Type.Object({
  invitationStatusFeedback: OrgInvitationFeedbackStatusUnionType,
  preferredTransports: Type.Array(Type.String()),
});
export type OrganisationInvitationFeedback = Static<
  typeof OrganisationInvitationFeedbackSchema
>;

export const InvitationFeedbackSchema = Type.Object({
  userStatusFeedback: UserStatusFeedbackUnionType,
});
export type InvitationFeedback = Static<typeof InvitationFeedbackSchema>;
