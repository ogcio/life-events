import { RedirectType, redirect } from "next/navigation";
import { getAuthenticationContext } from "../logto_integration/config";
import hasAdminPermissions from "../utils/hasAdminPermissions";

export default async () => {
  const context = await getAuthenticationContext();

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
