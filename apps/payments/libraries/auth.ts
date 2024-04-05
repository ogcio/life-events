import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "./logtoConfig";
import { redirect } from "next/navigation";

export const getUser = async (loginIfUnauthenticated = true) => {
  const context = await getLogtoContext(logtoConfig, { fetchUserInfo: true });
  if (!context.isAuthenticated && loginIfUnauthenticated) {
    redirect("/login");
  }

  return context;
};
