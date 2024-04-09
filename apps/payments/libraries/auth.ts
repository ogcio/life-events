import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "./logtoConfig";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const getUser = async (loginIfUnauthenticated = true) => {
  const context = await getLogtoContext(logtoConfig, {
    fetchUserInfo: true,
    getAccessToken: true,
    resource: "http://localhost:8001",
  });
  if (!context.isAuthenticated && loginIfUnauthenticated) {
    redirect("/login");
  }

  return context;
};

export const getAuthCookie = () => {
  const cookieStore = cookies();
  const cookie = cookieStore.get(`logto:${logtoConfig.appId}`);
  return cookie?.value;
};
