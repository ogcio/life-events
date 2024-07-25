import { hasPermissions } from "auth/check-permissions";

export default (accessToken: string, scopes: string[]) =>
  hasPermissions(accessToken as string, scopes, [
    "life-events:digital-wallet-flow:*",
  ]);
