import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "./logtoConfig";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const getUser = async () => {
  const context = await getLogtoContext(logtoConfig, {
    fetchUserInfo: true,
    getAccessToken: true,
    resource: "http://localhost:8001",
  });
  if (!context.isAuthenticated || !context.accessToken) {
    return redirect("/login");
  }

  return {
    accessToken: context.accessToken,
    ...context,
  };
};
