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
  move_in_date: Type.String(),
  move_out_date: Type.String(),
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

export const UpdateAddress = CreateAddress;
export type UpdateAddress = Static<typeof UpdateAddress>;
