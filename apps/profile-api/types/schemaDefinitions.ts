import { Static, Type } from "@sinclair/typebox";

/**
 * Addresses types
 */
export const AddressSchema = Type.Object({
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
export type Address = Static<typeof AddressSchema>;

export const AddressesListSchema = Type.Array(AddressSchema);
export type AddressesList = Static<typeof AddressesListSchema>;

export const CreateAddressSchema = Type.Object({
  addressLine1: Type.String(),
  addressLine2: Type.Optional(Type.String()),
  town: Type.String(),
  county: Type.String(),
  eirecode: Type.String(),
  moveInDate: Type.Optional(Type.String()),
  moveOutDate: Type.Optional(Type.String()),
});
export type CreateAddress = Static<typeof CreateAddressSchema>;

export const ParamsWithAddressIdSchema = Type.Object({
  addressId: Type.String(),
});
export type ParamsWithAddressId = Static<typeof ParamsWithAddressIdSchema>;

export const UpdateAddressSchema = Type.Object({
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
export type UpdateAddress = Static<typeof UpdateAddressSchema>;

export const PatchAddressSchema = Type.Object({
  isPrimary: Type.Optional(Type.Boolean()),
  ownershipStatus: Type.Optional(Type.String()),
});
export type PatchAddress = Static<typeof PatchAddressSchema>;

/**
 * Entitlements types
 */
export const EntitlementSchema = Type.Object({
  firstname: Type.String(),
  lastname: Type.String(),
  type: Type.String(),
  issueDate: Type.String(),
  expiryDate: Type.Optional(Type.String()),
  documentNumber: Type.String(),
});
export type Entitlement = Static<typeof EntitlementSchema>;

export const EntitlementsListSchema = Type.Array(EntitlementSchema);
export type EntitlementsList = Static<typeof EntitlementsListSchema>;

/**
 * User details types
 */

export const UserDetailsSchema = Type.Object({
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
export type UserDetails = Static<typeof UserDetailsSchema>;

/* Only firstname, lastname and email are required to create a user right now because 
 those are the only fields we always have access to via the current auth session -
 to be revised when we integrate with GOV ID
 */
export const CreateUserSchema = Type.Object({
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
export type CreateUser = Static<typeof CreateUserSchema>;

export const UpdateUserSchema = Type.Object({
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
export type UpdateUser = Static<typeof UpdateUserSchema>;

export const PatchUserSchema = Type.Object({
  ppsnVisible: Type.Optional(Type.Boolean()),
  consentToPrefillData: Type.Optional(Type.Boolean()),
});
export type PatchUser = Static<typeof PatchUserSchema>;
