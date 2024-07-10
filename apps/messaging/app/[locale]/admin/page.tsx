import { redirect, RedirectType } from "next/navigation";
import { sendAMessage } from "../../utils/routes";
import { AuthenticationContextFactory } from "auth/authentication-context-factory";
import { withContext } from "../with-context";

export default withContext(async () => {
  const isPublicServant = await AuthenticationContextFactory.isPublicServant();

  return redirect(
    isPublicServant ? sendAMessage.url : "/messages",
    RedirectType.replace,
  );
});
