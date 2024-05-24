import { PgSessions } from "auth/sessions";
import { redirect, RedirectType } from "next/navigation";
import { sendAMessage } from "../../utils/routes";

export default async () => {
  const { publicServant } = await PgSessions.get();

  return redirect(
    publicServant ? sendAMessage.url : "/messages",
    RedirectType.replace,
  );
};
