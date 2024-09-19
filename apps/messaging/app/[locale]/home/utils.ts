export const baseUrl = new URL("/home", process.env.HOST_URL);

export const unreadUrl = (() => {
  const url = new URL(baseUrl);
  url.searchParams.append("tab", "unread");
  return url;
})();

export const allUrl = (() => {
  const url = new URL(baseUrl);
  url.searchParams.append("tab", "all");
  return url;
})();
