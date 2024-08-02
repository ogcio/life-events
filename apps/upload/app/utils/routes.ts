export const logtoLogin = {
  url: "/login",
};

export const logtoSignout = {
  url: "/signout",
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
