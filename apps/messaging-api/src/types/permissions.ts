enum MessagePermissions {
  Read = "messaging:message:read",
  Write = "messaging:message:write",
}

enum MessageSelfPermissions {
  Read = "messaging:message.self:read",
  Write = "messaging:message.self:write",
}

enum MessagePublicPermissions {
  Read = "messaging:message.public:read",
  Write = "messaging:message.public:write",
}

enum CitizenPermissions {
  Read = "messaging:citizen:read",
  Write = "messaging:citizen:write",
}

enum CitizenSelfPermissions {
  Read = "messaging:citizen.self:read",
  Write = "messaging:citizen.self:write",
}

enum CitizenPublicPermissions {
  Read = "messaging:citizen.public:read",
  Write = "messaging:citizen.public:write",
}

enum ProviderPermissions {
  Read = "messaging:provider:read",
  Write = "messaging:provider:write",
  Delete = "messaging:provider:delete",
}

enum TemplatePermissions {
  Read = "messaging:template:read",
  Write = "messaging:template:write",
  Delete = "messaging:template:delete",
}

enum EventPermissions {
  Read = "messaging:event:read",
}

enum SchedulerPermissions {
  Write = "scheduler:jobs:write",
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
  Event: EventPermissions,
  Scheduler: SchedulerPermissions,
};
