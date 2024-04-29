import Link from "next/link";
import ds from "design-system/";
import { PgSessions } from "auth/sessions";
import { api } from "messages";

export default async ({ locale }: { locale: string }) => {
  const { userId } = await PgSessions.get();

  const unreadNotificationsCount = await api.getUnreadMessageCount(userId);

  return (
    <>
      <Link
        href={
          new URL(`/${locale}/messages`, process.env.MESSAGES_HOST_URL).href
        }
        style={{ display: "flex", position: "relative" }}
      >
        {unreadNotificationsCount > 0 && (
          <div
            style={{
              position: "absolute",
              top: "-10px",
              left: "-10px",
              background: ds.colours.ogcio.red,
              color: ds.colours.ogcio.white,
              borderRadius: "50%",
              width: "18px",
              height: "18px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "12px",
              zIndex: 1,
            }}
          >
            {unreadNotificationsCount}
          </div>
        )}
        <ds.Icon icon="notification" color={ds.colours.ogcio.white} size={20} />
      </Link>
    </>
  );
};
