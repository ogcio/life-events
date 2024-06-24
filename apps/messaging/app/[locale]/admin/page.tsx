import { PgSessions } from "auth/sessions";
import { redirect, RedirectType } from "next/navigation";
import { sendAMessage } from "../../utils/routes";
import { headers } from "next/headers";
import { getCorrelationId, getLogger } from "../../../libraries/logger";

export default async () => {
  const correlationId = getCorrelationId(headers());
  const logger = getLogger().child({ correlationId });
  logger.info("YUPPI YEAH YEAH YUPPI YEAH YEAH YUPPI");

  const { publicServant } = await PgSessions.get();

  return redirect(
    publicServant ? sendAMessage.url : "/messages",
    RedirectType.replace,
  );
};
