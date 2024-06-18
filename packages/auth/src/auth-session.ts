import { getLogtoContext, signIn, signOut } from "@logto/next/server-actions";
import { IAuthSession } from "./types";
import { redirect } from "next/navigation";
import { UserScope } from "@logto/next";

export const AuthUserScope = UserScope;

export const AuthSession: IAuthSession = {
  async login(config) {
    return signIn(config);
  },
  async logout(config, redirectUri) {
    return signOut(config, redirectUri);
  },
  async get(config, getContextParameters) {
    const context = await getLogtoContext(config, getContextParameters);

    if (!context.isAuthenticated) {
      redirect("/logto_integration/login");
    }

    return context;
  },
  async isAuthenticated(config, getContextParameters) {
    const context = await getLogtoContext(config, getContextParameters);

    return context.isAuthenticated;
  },
};
