import { Static, Type } from "@sinclair/typebox";

/**
 * Addresses types
 */
export const Address = Type.Object({
  addressId: Type.String(),
  addressLine1: Type.String(),
  addressLine2: Type.String(),
  town: Type.String(),
  county: Type.String(),
  eirecode: Type.String(),
  updatedAt: Type.String(),
  moveInDate: Type.Optional(Type.String()),
  moveOutDate: Type.Optional(Type.String()),
  isPrimary: Type.Optional(Type.Boolean()),
  ownershipStatus: Type.Optional(Type.String()),
});

export type Address = Static<typeof Address>;

export const AddressesList = Type.Array(Address);
export type AddressesList = Static<typeof AddressesList>;

export const CreateAddress = Type.Object({
  addressLine1: Type.String(),
  addressLine2: Type.Optional(Type.String()),
  town: Type.String(),
  county: Type.String(),
  eirecode: Type.String(),
  moveInDate: Type.Optional(Type.String()),
  moveOutDate: Type.Optional(Type.String()),
});

export type CreateAddress = Static<typeof CreateAddress>;

export const ParamsWithAddressId = Type.Object({
  addressId: Type.String(),
});
export type ParamsWithAddressId = Static<typeof ParamsWithAddressId>;

export const UpdateAddress = Type.Object({
  addressLine1: Type.String(),
  addressLine2: Type.Optional(Type.String()),
  town: Type.String(),
  county: Type.String(),
  eirecode: Type.String(),
  moveInDate: Type.Optional(Type.String()),
  moveOutDate: Type.Optional(Type.String()),
  isPrimary: Type.Boolean(),
  ownershipStatus: Type.String(),
});

export type UpdateAddress = Static<typeof UpdateAddress>;

export const PatchAddress = Type.Object({
  isPrimary: Type.Optional(Type.Boolean()),
  ownershipStatus: Type.Optional(Type.String()),
});

export type PatchAddress = Static<typeof PatchAddress>;

/**
 * Entitlements types
 */

export const Entitlement = Type.Object({
  firstname: Type.String(),
  lastname: Type.String(),
  type: Type.String(),
  issueDate: Type.String(),
  expiryDate: Type.Optional(Type.String()),
  documentNumber: Type.String(),
});

export type Entitlement = Static<typeof Entitlement>;

export const EntitlementsList = Type.Array(Entitlement);
export type EntitlementsList = Static<typeof EntitlementsList>;

/**
 * User details types
 */

export const UserDetails = Type.Object({
  firstname: Type.String(),
  lastname: Type.String(),
  email: Type.String(),
  title: Type.String(),
  dateOfBirth: Type.Optional(Type.String()),
  ppsn: Type.String(),
  ppsnVisible: Type.Boolean(),
  gender: Type.String(),
  phone: Type.String(),
  consentToPrefillData: Type.Boolean(),
});

export type UserDetails = Static<typeof UserDetails>;

/* Only firstname, lastname and email are required to create a user right now because 
 those are the only fields we always have access to via the current auth session -
 to be revised when we integrate with GOV ID
 */
export const CreateUser = Type.Object({
  firstname: Type.String(),
  lastname: Type.String(),
  email: Type.String(),
  title: Type.Optional(Type.String()),
  dateOfBirth: Type.Optional(Type.String()),
  ppsn: Type.Optional(Type.String()),
  ppsnVisible: Type.Optional(Type.Boolean()),
  gender: Type.Optional(Type.String()),
  phone: Type.Optional(Type.String()),
  consentToPrefillData: Type.Optional(Type.Boolean()),
});

export type CreateUser = Static<typeof CreateUser>;

export const UpdateUser = Type.Object({
  firstname: Type.String(),
  lastname: Type.String(),
  email: Type.String(),
  title: Type.String(),
  dateOfBirth: Type.String(),
  ppsn: Type.String(),
  ppsnVisible: Type.Boolean(),
  gender: Type.String(),
  phone: Type.String(),
  consentToPrefillData: Type.Optional(Type.Boolean()),
});

export type UpdateUser = Static<typeof UpdateUser>;

export const PatchUser = Type.Object({
  ppsnVisible: Type.Optional(Type.Boolean()),
  consentToPrefillData: Type.Optional(Type.Boolean()),
});

export type PatchUser = Static<typeof PatchUser>;
