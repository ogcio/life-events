import Link from "next/link";
import ds from "design-system/";
import { PgSessions } from "auth/sessions";
import { buildNotificationService } from "messages";

export default async () => {
  const { userId } = await PgSessions.get();
  const notificationService = buildNotificationService(userId);
  const unreadNotificationsCount =
    await notificationService.getUnreadNotificationsCount();

  return (
    <>
      <Link
        href="/notifications"
        style={{ display: "flex", position: "relative" }}
      >
        {unreadNotificationsCount && unreadNotificationsCount > 0 && (
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
