import { PgSessions } from "auth/sessions";
import { buildNotificationService } from "messages";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import dayjs from "dayjs";
import ds from "design-system";
import { web } from "../../utils";

async function markAsRead(formData: FormData) {
  "use server";

  const notificationId = formData.get("id") as string;
  const userId = formData.get("userId") as string;
  const actionUrl = formData.get("actionUrl") as string;
  const notificationService = buildNotificationService(userId);
  await notificationService.markNotioficationAsRead(notificationId);

  redirect(actionUrl);
}

async function searchAction(formData: FormData) {
  "use server";
  const search = formData.get("search") as string;
  if (search.trim().length > 0) redirect("notifications?search=" + search);
  redirect("notifications");
}

// This seed function is just for debugging purposes
async function seedNotifications(userId: string) {
  "use server";
  console.log("Cannot find notifications, seeding...");
  const notificationService = buildNotificationService(userId);

  for (const a of [1, 2, 3, 4]) {
    await notificationService.createNotification({
      subject: "Subject Notification N." + a,
      action: "renew",
      actionUrl: "/renew/" + a,
      type: "action",
      createdAt: new Date(),
      read: a % 2 === 0,
    });
  }

  revalidatePath("/");
}

export default async (props: web.NextPageProps) => {
  const t = await getTranslations("Notifications");
  const { userId } = await PgSessions.get();
  const notificationService = buildNotificationService(userId);

  const search = props.searchParams?.search;
  const notifications = await notificationService.getNotifications(search);

  if (notifications.length === 0) await seedNotifications(userId);

  return (
    <main className="govie-main-wrapper " id="main-content" role="main">
      <h1 className="govie-panel__title">{t("title")}</h1>

      <form action={searchAction}>
        <div className="govie-form-group" style={{ display: "flex" }}>
          <input
            type="text"
            name="search"
            className="govie-input"
            placeholder={t("searchHint")}
            defaultValue={props.searchParams?.search}
          />

          <button
            id="button"
            data-module="govie-button"
            style={{
              backgroundColor: ds.colours.ogcio.gold,
              width: "40px",
              height: "40px",
              margin: "0px",
              padding: "0px",
              borderRadius: "0px",
              border: "0px solid transparent",
            }}
          >
            <ds.Icon icon="search" color={ds.colours.ogcio.white} size={28} />
          </button>
        </div>
      </form>

      <table className="govie-table">
        <thead className="govie-table__head">
          <tr className="govie-table__row">
            <th scope="col" className="govie-table__header">
              {t("list.date")}
            </th>
            <th scope="col" className="govie-table__header">
              {t("list.subject")}
            </th>
            <th scope="col" className="govie-table__header">
              {t("list.type")}
            </th>
            <th scope="col" className="govie-table__header">
              {t("list.actions")}
            </th>
          </tr>
        </thead>
        <tbody className="govie-table__body">
          {notifications.map((notification) => (
            <tr
              className="govie-table__row"
              key={notification.id}
              style={{
                backgroundColor: !notification.read
                  ? ds.hexToRgba(ds.colours.ogcio.gold, 10)
                  : undefined,
              }}
            >
              <th className="govie-table__header" scope="row">
                {dayjs(notification.createdAt).format("DD/MM/YYYY")}
              </th>
              <th className="govie-table__header" scope="row">
                {notification.subject}
              </th>
              <th className="govie-table__header" scope="row">
                {t(`types.${notification.type}`)}
              </th>
              <td className="govie-table__cell">
                <form action={markAsRead}>
                  <input
                    type="hidden"
                    name="actionUrl"
                    defaultValue={notification.actionUrl}
                  />
                  <input
                    type="hidden"
                    name="id"
                    defaultValue={notification.id}
                  />
                  <input type="hidden" name="userId" defaultValue={userId} />
                  <button
                    className="govie-button govie-button--flat"
                    style={{ marginBottom: "0px", padding: "0px" }}
                  >
                    {t(`actions.${notification.action}`)}
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
};
