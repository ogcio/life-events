import { PgSessions } from "auth/sessions";
import { api } from "messages";
import dayjs from "dayjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import ds from "design-system";

export default async (props: { searchParams: any }) => {
  const t = await getTranslations("Messages");
  const { email } = await PgSessions.get();
  const params = new URLSearchParams(props.searchParams);

  const messages = await api.getMessages(email, {
    search: params.get("search")?.toString() || "",
    page: 1,
    size: 10,
  });

  async function searchAction(formData: FormData) {
    "use server";
    const search = formData.get("search")?.toString() || "";
    redirect(`?${new URLSearchParams({ search })}`);
  }

  return (
    <>
      <h1 className="govie-heading-l">{t("header")}</h1>
      <form action={searchAction}>
        <div className="govie-form-group">
          <div className="govie-input__wrapper">
            <input
              type="text"
              id="search"
              name="search"
              className="govie-input"
              autoComplete="off"
              defaultValue={props.searchParams.search || ""}
              autoFocus
              placeholder={t("searchPlaceholder")}
            />
            <button
              aria-hidden="true"
              className="govie-input__suffix"
              style={{
                background: ds.colours.ogcio.gold,
                borderColor: ds.colours.ogcio.gold,
              }}
            >
              <ds.Icon icon="search" color={ds.colours.ogcio.white} />
            </button>
          </div>
        </div>
      </form>
      <table className="govie-table">
        <thead className="govie-table__head">
          <tr className="govie-table__row">
            <th scope="col" className="govie-table__header">
              {t("date")}
            </th>
            <th scope="col" className="govie-table__header">
              {t("type")}
            </th>
            <th scope="col" className="govie-table__header">
              {t("status")}
            </th>
            <th scope="col" className="govie-table__header">
              {t("subject")}
            </th>
          </tr>
        </thead>
        <tbody className="govie-table__body">
          {messages.map((msg) => (
            <tr key={msg.messageId} className="govie-table__row">
              <th
                className="govie-table__cell govie-!-font-weight-regular"
                scope="row"
              >
                {dayjs(msg.createdAt).format("DD/MM/YYYY")}
              </th>
              <th
                className="govie-table__cell govie-!-font-weight-regular"
                scope="row"
              >
                {msg.type}
              </th>
              <th
                className="govie-table__cell govie-!-font-weight-regular"
                scope="row"
              ></th>
              <th
                className="govie-table__cell govie-!-font-weight-regular"
                scope="row"
              >
                <Link
                  href={
                    new URL(`/messages/${msg.messageId}`, process.env.HOST_URL)
                      .href
                  }
                >
                  {msg.subject}
                </Link>
              </th>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
