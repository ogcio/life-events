import { redirect, RedirectType } from "next/navigation";
import { sendAMessage } from "../../utils/routes";
import { getAuthenticationContext } from "../logto_integration/config";

export default async () => {
  const { isPublicServant } = await getAuthenticationContext();

  return redirect(
    isPublicServant ? sendAMessage.url : "/messages",
    RedirectType.replace,
  );
};
