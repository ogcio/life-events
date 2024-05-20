import { Static, Type } from "@sinclair/typebox";

const InvitationStatusUnionType = Type.Union([
  Type.Literal("pending"),
  Type.Literal("accepted"),
  Type.Literal("declined"),
]);

const UserStatusUnionType = Type.Union([
  Type.Literal("pending"),
  Type.Literal("disabled"),
  Type.Literal("active"),
]);

const ImportChannelUnionType = Type.Union([
  Type.Literal("api"),
  Type.Literal("csv"),
]);

const NullableStringType = Type.Union([Type.Null(), Type.String()], {
  default: null,
});

export const UserSchema = Type.Object({
  id: Type.String(),
  userProfileId: NullableStringType,
  importerOrganisationId: Type.String(),
  userStatus: UserStatusUnionType,
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

export const ToImportUserSchema = Type.Object({
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
    { default: null },
  ),
});

export type ToImportUser = Static<typeof ToImportUserSchema>;

export const UsersImportSchema = Type.Object({
  organisationId: Type.String(),
  importedAt: Type.String(),
  usersData: Type.Array(ToImportUserSchema),
  importChannel: ImportChannelUnionType,
});
