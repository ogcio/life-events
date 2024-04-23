import { Static, Type } from "@sinclair/typebox";

/**
 * Addresses types
 */
export const Address = Type.Object({
  address_id: Type.String(),
  address_line1: Type.String(),
  address_line2: Type.String(),
  town: Type.String(),
  county: Type.String(),
  eirecode: Type.String(),
  updated_at: Type.String(),
  move_in_date: Type.Optional(Type.String()),
  move_out_date: Type.Optional(Type.String()),
  is_primary: Type.Optional(Type.Boolean()),
  ownership_status: Type.Optional(Type.String()),
});

export type Address = Static<typeof Address>;

export const AddressesList = Type.Array(Address);
export type AddressesList = Static<typeof AddressesList>;

export const CreateAddress = Type.Object({
  address_line1: Type.String(),
  address_line2: Type.Optional(Type.String()),
  town: Type.String(),
  county: Type.String(),
  eirecode: Type.String(),
  move_in_date: Type.Optional(Type.String()),
  move_out_date: Type.Optional(Type.String()),
});

export type CreateAddress = Static<typeof CreateAddress>;

export const ParamsWithAddressId = Type.Object({
  addressId: Type.String(),
});
export type ParamsWithAddressId = Static<typeof ParamsWithAddressId>;

export const UpdateAddress = Type.Object({
  address_line1: Type.Optional(Type.String()),
  address_line2: Type.Optional(Type.String()),
  town: Type.Optional(Type.String()),
  county: Type.Optional(Type.String()),
  eirecode: Type.Optional(Type.String()),
  move_in_date: Type.Optional(Type.String()),
  move_out_date: Type.Optional(Type.String()),
  is_primary: Type.Optional(Type.Boolean()),
  ownership_status: Type.Optional(Type.String()),
});

export type UpdateAddress = Static<typeof UpdateAddress>;

/**
 * Entitlements types
 */

export const Entitlement = Type.Object({
  firstname: Type.String(),
  lastname: Type.String(),
  type: Type.String(),
  issue_date: Type.String(),
  expiry_date: Type.Optional(Type.String()),
  document_number: Type.String(),
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
  date_of_birth: Type.Optional(Type.String()),
  ppsn: Type.String(),
  ppsn_visible: Type.Boolean(),
  gender: Type.String(),
  phone: Type.String(),
  consent_to_prefill_data: Type.Boolean(),
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
  date_of_birth: Type.Optional(Type.String()),
  ppsn: Type.Optional(Type.String()),
  ppsn_visible: Type.Optional(Type.Boolean()),
  gender: Type.Optional(Type.String()),
  phone: Type.Optional(Type.String()),
  consent_to_prefill_data: Type.Optional(Type.Boolean()),
});

export type CreateUser = Static<typeof CreateUser>;

export const UpdateUser = Type.Object({
  firstname: Type.Optional(Type.String()),
  lastname: Type.Optional(Type.String()),
  email: Type.Optional(Type.String()),
  title: Type.Optional(Type.String()),
  date_of_birth: Type.Optional(Type.String()),
  ppsn: Type.Optional(Type.String()),
  ppsn_visible: Type.Optional(Type.Boolean()),
  gender: Type.Optional(Type.String()),
  phone: Type.Optional(Type.String()),
  consent_to_prefill_data: Type.Optional(Type.Boolean()),
});

export type UpdateUser = Static<typeof UpdateUser>;
