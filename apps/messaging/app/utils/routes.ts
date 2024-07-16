export const sendAMessage = {
  slug: "send-a-message",
  url: "admin/send-a-message",
};

export const messageTemplates = {
  slug: "message-templates",
  url: "admin/message-templates",
};

export const messages = {
  slug: "messages",
};

export const settings = {
  slug: "settings",
};

export const providerRoutes = {
  slug: "providers",
  url: "admin/providers",
};

export const templateRoutes = {
  slug: "template",
  url: `${messageTemplates.url}/template`,
};

export const users = {
  slug: "users",
  url: "admin/users",
};

export const events = {
  slug: "events",
  url: "admin/message-events",
};

export const usersImports = {
  slug: "users-imports",
  url: "admin/users/imports",
};

export const usersSettingsRoutes = {
  slug: "user settings",
  url: "settings",
};

export const userOrganisationsRoutes = {
  slug: "user organisations",
  url: "settings/organisations",
};

export function urlWithSearchParams(
  dir: string,
  ...searchParams: { key: string; value?: string }[]
): URL {
  const url = new URL(dir, process.env.HOST_URL);
  for (const param of searchParams) {
    if (param.value) {
      url.searchParams.append(param.key, param.value);
    }
  }
  return url;
}
