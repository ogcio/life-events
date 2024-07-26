import { hasPermissions } from "auth/check-permissions";
import { publicServantScopes } from "../../../utils/logto-config";

export default (accessToken: string, scopes: string[]) =>
  hasPermissions(accessToken as string, scopes, publicServantScopes);
