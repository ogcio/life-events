enum MessagePermissions {
  Read = "messaging:message:read",
  Write = "messaging:message:Write",
}

enum MessageSelfPermissions {
  Read = "messaging:message.self:read",
  Write = "messaging:message.self:Write",
}

enum MessagePublicPermissions {
  Read = "messaging:message.public:read",
  Write = "messaging:message.public:Write",
}

enum CitizenPermissions {
  Read = "messaging:citizen:read",
  Write = "messaging:citizen:Write",
}

enum CitizenSelfPermissions {
  Read = "messaging:citizen.self:read",
  Write = "messaging:citizen.self:Write",
}

enum CitizenPublicPermissions {
  Read = "messaging:citizen.public:read",
  Write = "messaging:citizen.public:Write",
}

enum ProviderPermissions {
  Read = "messaging:provider:read",
  Write = "messaging:provider:Write",
}

enum TemplatePermissions {
  Read = "messaging:template:read",
  Write = "messaging:template:Write",
}

export const Permissions = {
  Message: MessagePermissions,
  MessageSelf: MessageSelfPermissions,
  MessagePublic: MessagePublicPermissions,
  Citizen: CitizenPermissions,
  CitizenPublic: CitizenPublicPermissions,
  CitizenSelf: CitizenSelfPermissions,
  Provider: ProviderPermissions,
  Template: TemplatePermissions,
};
