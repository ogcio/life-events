import { hasPermissions } from "auth/check-permissions";
import { citizenScopes } from "../../../utils/logto-config";

export default (accessToken: string, scopes: string[]) =>
  hasPermissions(accessToken, scopes, citizenScopes);
