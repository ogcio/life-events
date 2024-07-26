import { Static, Type } from "@sinclair/typebox";
import { PreferredTransports } from "./schemaDefinitions";

const NullableStringType = Type.Union([Type.Null(), Type.String()], {
  default: null,
});
const NullableOptionalStringType = Type.Optional(NullableStringType);

export const InvitationStatusUnionType = Type.Union(
  [
    Type.Literal("to_be_invited"),
    Type.Literal("pending"),
    Type.Literal("accepted"),
    Type.Literal("declined"),
  ],
  { default: "pending" },
);
export type InvitationStatus = Static<typeof InvitationStatusUnionType>;

export const OrgInvitationFeedbackStatusUnionType = Type.Union(
  [Type.Literal("accepted"), Type.Literal("declined")],
  { default: "accepted" },
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
  { default: "pending" },
);
export type UserStatus = Static<typeof UserStatusUnionType>;

export const UserStatusFeedbackUnionType = Type.Union(
  [Type.Literal("disabled"), Type.Literal("active")],
  { default: "active" },
);
export type UserStatusFeedback = Static<typeof UserStatusFeedbackUnionType>;

export const ImportChannelUnionType = Type.Union(
  [Type.Literal("api"), Type.Literal("csv")],
  { default: "api" },
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
  { default: "pending" },
);
export type ImportStatus = Static<typeof ImportStatusUnionType>;

export const CorrelationQualityUnionType = Type.Union([
  Type.Literal("full"),
  Type.Literal("partial"),
  Type.Literal("not_related"),
]);
export type CorrelationQuality = Static<typeof CorrelationQualityUnionType>;

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
    { default: null },
  ),
  collectedConsent: Type.Boolean({ default: false }),
});
export type UserDetails = Static<typeof UserDetailsSchema>;

export const OrganisationUserConfigSchema = Type.Object({
  organisationId: Type.String(),
  userId: Type.String({ format: "uuid" }),
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
    importError: NullableOptionalStringType,
    relatedUserProfileId: NullableOptionalStringType,
    relatedUserId: NullableOptionalStringType,
    tags: Type.Optional(Type.Array(Type.String())),
  }),
  UserDetailsSchema,
]);
export type ToImportUser = Static<typeof ToImportUserSchema>;

export const UsersImportSchema = Type.Object({
  organisationId: Type.String(),
  importedAt: Type.String({ format: "date-time" }),
  usersData: Type.Array(ToImportUserSchema),
  importChannel: ImportChannelUnionType,
  retryCount: Type.Integer({ default: 0 }),
  lastRetryAt: Type.Union([Type.String({ format: "date-time" }), Type.Null()], {
    default: null,
  }),
  importId: Type.String(),
});
export type UsersImport = Static<typeof UsersImportSchema>;

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
  collectedConsent: NullableOptionalStringType,
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

export const UserSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
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

export const OrganisationSettingSchema = Type.Object({
  userId: Type.String({ format: "uuid" }),
  userProfileId: Type.Union([Type.Null(), Type.String()], {
    default: null,
  }),
  phoneNumber: NullableStringType,
  emailAddress: NullableStringType,
  organisationId: Type.String(),
  organisationInvitationStatus: InvitationStatusUnionType,
  organisationInvitationSentAt: Type.Optional(Type.String()),
  organisationInvitationFeedbackAt: Type.Optional(Type.String()),
  organisationPreferredTransports: PreferredTransports,
  correlationQuality: CorrelationQualityUnionType,
  userStatus: UserStatusUnionType,
  details: Type.Optional(UserDetailsSchema),
});
export type OrganisationSetting = Static<typeof OrganisationSettingSchema>;

export const UserPerOrganisationSchema = Type.Composite([
  Type.Object({
    firstName: NullableStringType,
    lastName: NullableStringType,
    phoneNumber: NullableStringType,
    emailAddress: NullableStringType,
    birthDate: NullableStringType,
    lang: NullableStringType,
    ppsn: NullableStringType,
  }),
  OrganisationSettingSchema,
]);
export type UserPerOrganisation = Static<typeof UserPerOrganisationSchema>;
