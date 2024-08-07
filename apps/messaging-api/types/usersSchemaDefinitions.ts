import { Static, Type } from "@sinclair/typebox";
import {
  EditableProviderTypesSchema,
  TypeboxStringEnum,
} from "./schemaDefinitions";

const NullableStringType = (options?: {
  description?: string;
  [x: string]: string | boolean | undefined | string[];
}) =>
  Type.Union([Type.Null(), Type.String()], {
    default: null,
    ...(options ?? {}),
  });

const NullableOptionalStringType = (options?: {
  description?: string;
  [x: string]: string | boolean | undefined | string[];
}) => Type.Optional(NullableStringType(options));

export const InvitationStatusUnionType = TypeboxStringEnum(
  ["to_be_invited", "pending", "accepted", "declined"],
  "pending",
  "Current status of the invitation to the messaging building block",
);
export type InvitationStatus = Static<typeof InvitationStatusUnionType>;

export const OrgInvitationFeedbackStatusUnionType = TypeboxStringEnum(
  ["accepted", "declined"],
  "accepted",
  "Current status of the invitation to receive messages from the organisation",
);
export type OrgInvitationFeedbackStatus = Static<
  typeof OrgInvitationFeedbackStatusUnionType
>;

export const UserStatusUnionType = TypeboxStringEnum(
  ["to_be_invited", "pending", "disabled", "active"],
  "pending",
);
export type UserStatus = Static<typeof UserStatusUnionType>;

export const UserStatusFeedbackUnionType = TypeboxStringEnum(
  ["disabled", "active"],
  "active",
  "Status of the user in the messaging building block",
);
export type UserStatusFeedback = Static<typeof UserStatusFeedbackUnionType>;

export const ImportChannelUnionType = TypeboxStringEnum(
  ["api", "csv"],
  "api",
  "Channel through which the users have been imported",
);
export type ImportChannel = Static<typeof ImportChannelUnionType>;

export const ImportStatusUnionType = TypeboxStringEnum(
  ["pending", "imported", "not_found", "error", "missing_contacts"],
  "pending",
  "Result of the import for the user",
);
export type ImportStatus = Static<typeof ImportStatusUnionType>;

export const CorrelationQualityUnionType = TypeboxStringEnum(
  ["full", "partial", "not_related"],
  undefined,
  "If full, it means that the user is already on the Life Events platform, if partial the match has to be reviewed, if not_related the user does not exist",
);
export type CorrelationQuality = Static<typeof CorrelationQualityUnionType>;

export const UserDetailsSchema = Type.Object({
  publicIdentityId: NullableStringType({
    description: "PPSN of the imported user",
  }),
  firstName: NullableStringType({
    description: "First name of the imported user",
  }),
  lastName: NullableStringType({
    description: "Last name of the imported user",
  }),
  birthDate: NullableStringType({
    description: "Birth date of the imported user",
  }),
  address: Type.Union(
    [
      Type.Object({
        city: NullableStringType(),
        zipCode: NullableStringType(),
        street: NullableStringType(),
        country: NullableStringType(),
        region: NullableStringType(),
      }),
      Type.Null(),
    ],
    { default: null, description: "Address of the imported user" },
  ),
  collectedConsent: Type.Boolean({
    default: false,
    description:
      "If false, an invitation to the user asking to accept to receive messages from the organisation will be sent. If true, it means that the organisation already asked the permissions to the user",
  }),
});
export type UserDetails = Static<typeof UserDetailsSchema>;

export const OrganisationUserConfigSchema = Type.Object({
  id: Type.Optional(
    Type.String({
      format: "uuid",
      description: "Unique id of the organisation setting",
    }),
  ),
  organisationId: Type.String({
    description: "Unique id of the related organisation",
  }),
  userId: Type.String({
    format: "uuid",
    description: "Unique id of the related user",
  }),
  invitationStatus: InvitationStatusUnionType,
  invitationSentAt: NullableStringType({
    description: "Date and time describing when the invitation has been sent",
  }),
  invitationFeedbackAt: NullableStringType({
    description:
      "Date and time describing when the user gave a feedback to the invitation",
  }),
  preferredTransports: Type.Array(EditableProviderTypesSchema, {
    default:
      "The list of the preferred transports to use. If the selected transports are not available for the recipient, others will be used",
  }),
});
export type OrganisationUserConfig = Static<
  typeof OrganisationUserConfigSchema
>;

export const ToImportUserSchema = Type.Composite([
  Type.Object({
    importIndex: Type.Integer(),
    phoneNumber: NullableStringType({
      description: "Phone number of the user",
    }),
    emailAddress: NullableStringType({
      description: "Email address of the user",
    }),
    importStatus: ImportStatusUnionType,
    importError: NullableOptionalStringType({
      description: "The error raised during the import, if set",
    }),
    relatedUserProfileId: NullableOptionalStringType({
      description:
        "Related user profile id from the Life Events building block, if available",
    }),
    relatedUserId: NullableOptionalStringType({
      description:
        "Related user id from the Messaging building block, if available",
    }),
    tags: Type.Optional(
      Type.Array(Type.String(), { description: "Tags related to the user" }),
    ),
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
  importIndex: Type.Integer({
    description:
      "Numeric index of the user to import. It must increments by one across users so to be able to notify which users' import failed",
  }),
  publicIdentityId: NullableOptionalStringType({
    description: "PPSN of the user to be imported",
  }),
  firstName: NullableOptionalStringType({
    description: "First name of the user to be imported",
  }),
  lastName: NullableOptionalStringType({
    description: "Last name of the user to be imported",
  }),
  phoneNumber: NullableOptionalStringType({
    description: "Phone number of the user to be imported",
  }),
  birthDate: NullableOptionalStringType({
    description: "Birth date of the user to be imported",
  }),
  emailAddress: NullableOptionalStringType({
    description: "Email address of the user to be imported",
  }),
  addressCity: NullableOptionalStringType({
    description: "City of the user to be imported",
  }),
  addressZipCode: NullableOptionalStringType({
    description: "Zip Code of the user to be imported",
  }),
  addressStreet: NullableOptionalStringType({
    description: "Street of the user to be imported",
  }),
  addressCountry: NullableOptionalStringType({
    description: "Country of the user to be imported",
  }),
  addressRegion: NullableOptionalStringType({
    description: "Region of the user to be imported",
  }),
  tags: NullableOptionalStringType({
    description:
      "Tags of the user to be imported. The tags can made by multiple levels, splitting each level by a '.' and listing multiple tags using a ';'",
    examples: ["region.county;role.job"],
  }),
  collectedConsent: NullableOptionalStringType({
    default: false,
    description:
      "If false, an invitation to the user asking to accept to receive messages from the organisation will be sent. If true, it means that the organisation already asked the permissions to the user",
  }),
});
export type CsvRecord = Static<typeof CsvRecordSchema>;

export const TagSchema = Type.Object({
  id: Type.String({ format: "uuid", description: "Unique id of the tag" }),
  tagName: Type.Lowercase(Type.String({ description: "Tag name" })),
  tagPath: Type.Lowercase(
    Type.String({ description: "Full tag path", examples: ["first.second"] }),
  ),
});
export type Tag = Static<typeof TagSchema>;

export const TagForUserSchema = Type.Object({
  userId: Type.String({ format: "uuid", description: "Unique user id" }),
  tagId: Type.String({ format: "uuid", description: "Unique tag id" }),
});

export type TagForUser = Static<typeof TagForUserSchema>;

export const UserSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  userProfileId: NullableStringType({
    description:
      "Related user profile id from the Life Events building block, if available",
  }),
  importerOrganisationId: Type.String({
    description: "Organisation which imported the user",
  }),
  userStatus: UserStatusUnionType,
  correlationQuality: CorrelationQualityUnionType,
  phone: NullableStringType({ description: "Phone number of the user" }),
  email: NullableStringType({ description: "Email address of the user" }),
  details: Type.Optional(UserDetailsSchema),
  usersImportId: NullableStringType({
    description: "Unique id of the users import batch",
  }),
});
export type User = Static<typeof UserSchema>;

export const OrganisationInvitationFeedbackSchema = Type.Object({
  invitationStatusFeedback: OrgInvitationFeedbackStatusUnionType,
  preferredTransports: Type.Array(EditableProviderTypesSchema, {
    description:
      "The list of the preferred transports to use. If the selected transports are not available for the recipient, others will be used",
  }),
});
export type OrganisationInvitationFeedback = Static<
  typeof OrganisationInvitationFeedbackSchema
>;

export const InvitationFeedbackSchema = Type.Object({
  userStatusFeedback: UserStatusFeedbackUnionType,
});
export type InvitationFeedback = Static<typeof InvitationFeedbackSchema>;

export const OrganisationSettingSchema = Type.Object({
  id: Type.String({
    format: "uuid",
    description: "Unique id of the organisation setting",
  }),
  userId: Type.String({
    format: "uuid",
    description: "Unique id of the related user",
  }),
  userProfileId: Type.Union([Type.Null(), Type.String()], {
    default: null,
    description: "User profile id, if available",
  }),
  phoneNumber: NullableStringType({
    description: "Phone number of the user",
  }),
  emailAddress: NullableStringType({
    description: "Email address of the user",
  }),
  organisationId: Type.String({
    description: "Unique id of the related organisation",
  }),
  organisationInvitationStatus: InvitationStatusUnionType,
  organisationInvitationSentAt: Type.Optional(
    Type.String({
      description:
        "Date and time describing when the organisation invitation has been sent",
    }),
  ),
  organisationInvitationFeedbackAt: Type.Optional(
    Type.String({
      description:
        "Date and time describing when the user has gave a feedback to the organisation invitation",
    }),
  ),
  organisationPreferredTransports: Type.Array(EditableProviderTypesSchema, {
    description:
      "The list of the preferred transports to use. If the selected transports are not available for the recipient, others will be used",
  }),
  correlationQuality: CorrelationQualityUnionType,
  userStatus: UserStatusUnionType,
  details: Type.Optional(UserDetailsSchema),
});
export type OrganisationSetting = Static<typeof OrganisationSettingSchema>;

export const UserPerOrganisationSchema = Type.Composite([
  Type.Object({
    organizationSettingId: Type.String({
      format: "uuid",
      description: "Unique id of the organisation setting",
    }),
    firstName: NullableStringType({ description: "First name of the user" }),
    lastName: NullableStringType({ description: "Last name of the user" }),
    birthDate: NullableStringType({ description: "Birth date of the user" }),
    lang: NullableStringType({ description: "Preferred language of the user" }),
    ppsn: NullableStringType({ description: "PPSN of the user" }),
  }),
  Type.Omit(OrganisationSettingSchema, ["id"]),
]);
export type UserPerOrganisation = Static<typeof UserPerOrganisationSchema>;
