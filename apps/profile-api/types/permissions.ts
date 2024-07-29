enum UserPermissions {
  Read = "profile:user:read",
  Write = "profile:user:write",
}

enum UserSelfPermissions {
  Read = "profile:user.self:read",
  Write = "profile:user.self:write",
}

enum AddressPermissions {
  Read = "profile:address:read",
  Write = "profile:address:write",
}

enum AddressSelfPermissions {
  Read = "profile:address.self:read",
  Write = "profile:address.self:write",
}

enum EntitlementPermissions {
  Read = "profile:entitlement:read",
  Write = "profile:entitlement:write",
}

enum EntitlementSelfPermissions {
  Read = "profile:entitlement.self:read",
  Write = "profile:entitlement.self:write",
}

export const Permissions = {
  User: UserPermissions,
  UserSelf: UserSelfPermissions,
  Address: AddressPermissions,
  AddressSelf: AddressSelfPermissions,
  Entitlement: EntitlementPermissions,
  EntitlementSelf: EntitlementSelfPermissions,
};
