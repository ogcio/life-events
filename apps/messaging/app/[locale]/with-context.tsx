import { AuthenticationContextFactory } from "auth/authentication-context-factory";
import { getAuthenticationContextConfig } from "./logto_integration/config";

export function withContext(Component) {
  return function WithContext(props) {
    AuthenticationContextFactory.setConfig(getAuthenticationContextConfig());
    return <Component {...props} />;
  };
}
