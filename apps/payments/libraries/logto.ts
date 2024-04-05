"use server";
import { cookies } from "next/headers";
import LogtoClient from "@logto/next/server-actions";

const config = {
  //TODO: Load from env var
  appId: "b5cjre4p352dyuf85uey8",
  cookieSecure: process.env.NODE_ENV === "production",
  // Change to your own base URL - TODO: Load from env var
  baseUrl: "http://localhost:3001",
};

const logtoClient = new LogtoClient({
  //TODO: Load from env var
  endpoint: "http://localhost:3301/",
  appId: config.appId,
  //TODO: Load from env var - - TODO: Save in secret manager
  appSecret: "BmwGrQHugwDbgYs9gxUvZf8soV4cGvSd",
  baseUrl: config.baseUrl,
  // Auto-generated 32 digit secret - TODO: Load from env var - TODO: Save in secret manager
  cookieSecret: "CRyNGTYSGJIVoAFZc0ACJUChaFo1A3rr",
  cookieSecure: config.cookieSecure,
});

const cookieName = `logto:${config.appId}`;

const setCookies = (value?: string) => {
  if (value === undefined) {
    return;
  }

  cookies().set(cookieName, value, {
    maxAge: 14 * 3600 * 24,
    secure: config.cookieSecure,
  });
};

const getCookie = () => {
  return cookies().get(cookieName)?.value ?? "";
};

export const signIn = async () => {
  const { url, newCookie } = await logtoClient.handleSignIn(
    getCookie(),
    `${config.baseUrl}`,
  );

  setCookies(newCookie);

  return url;
};

export const handleSignIn = async (searchParams: URLSearchParams) => {
  const search = searchParams.toString();

  const newCookie = await logtoClient.handleSignInCallback(
    getCookie(),
    `${config.baseUrl}/callback?${search}`,
  );

  setCookies(newCookie);
};

export const signOut = async () => {
  const url = await logtoClient.handleSignOut(getCookie(), `${config.baseUrl}`);

  setCookies("");

  return url;
};

export const getLogtoContext = async (config?) => {
  const cookie = getCookie();
  console.log(cookie);
  return logtoClient.getLogtoContext(cookie, config);
};
