import { RedirectType, redirect } from "next/navigation";
import hasAdminPermissions from "../utils/hasAdminPermissions";
import { AuthenticationFactory } from "../../../utils/authentication-factory";

export default async () => {
  const authFactory = AuthenticationFactory.getInstance();
  const context = await authFactory.getPublicServant();

  const hasPermissions = hasAdminPermissions(
    context.accessToken as string,
    context.scopes,
  );

  if (hasPermissions) {
    return redirect("/admin", RedirectType.replace);
  }

  return (
    <>
      <h3>Missing permission to check this page please contact...</h3>
    </>
  );
};
