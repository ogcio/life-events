export const baseUrl = new URL("/home", process.env.HOST_URL);

export const unreadUrl = new URL(baseUrl);
unreadUrl.searchParams.append("tab", "unread");

export const allUrl = new URL(baseUrl);
allUrl.searchParams.append("tab", "all");
