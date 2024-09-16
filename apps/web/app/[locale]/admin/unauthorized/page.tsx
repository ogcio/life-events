import { RedirectType, redirect } from "next/navigation";
import { AuthenticationFactory } from "../../../utils/authentication-factory";

export default async () => {
  const authFactory = AuthenticationFactory.getInstance();
  const context = await authFactory.getPublicServant();

  if (context.isPublicServant) {
    return redirect("/admin", RedirectType.replace);
  }

  return (
    <>
      <h3>Missing permission to check this page please contact...</h3>
    </>
  );
};
