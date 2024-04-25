import { PgSessions } from "auth/sessions";
import { Messaging } from "building-blocks-sdk";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";

const SmsProviderTable = ({
  providers,
}: {
  providers: { id: string; name: string; type: string }[];
}) => {
  const t = useTranslations("settings.Sms");
  async function deleteAction(formData: FormData) {
    "use server";
    const id = formData.get("id")?.toString();

    const { userId } = await PgSessions.get();

    if (id) {
      const { error } = await new Messaging(userId).deleteSmsProvider(id);
      if (error) {
        // error handling
      }

      revalidatePath("/");
    }
  }

  return (
    <table className="govie-table">
      <thead className="govie-table__head">
        <tr className="govie-table__row">
          <th scope="col" className="govie-table__header">
            {t("nameTableHeader")}
          </th>
          <th scope="col" className="govie-table__header">
            {t("typeTableHeader")}
          </th>
          <th scope="col" className="govie-table__header">
            {t("actionTableHeader")}
          </th>
        </tr>
      </thead>
      <tbody className="govie-table__body">
        {providers.map((provider) => (
          <tr className="govie-table__row">
            <th className="govie-table__header govie-table__header--vertical-centralized govie-body-s">
              {provider.name}
            </th>
            <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
              {provider.type}
            </td>

            <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
              <div style={{ display: "flex", alignItems: "center" }}>
                <Link
                  className="govie-link govie-!-margin-right-3"
                  href={(() => {
                    const url = new URL(
                      `admin/settings/sms/provider`,
                      process.env.HOST_URL,
                    );
                    url.searchParams.append("id", provider.id);
                    return url.href;
                  })()}
                >
                  {t("editLink")}
                </Link>
                <form
                  action={deleteAction}
                  className="govie-!-margin-right-3"
                  style={{ display: "inline-block" }}
                >
                  <input type="hidden" name="id" value={provider.id} />
                  <button
                    type="submit"
                    className="govie-button govie-button--small govie-button--outlined"
                    style={{ margin: "unset" }}
                  >
                    {t("deleteButton")}
                  </button>
                </form>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default async () => {
  const t = await getTranslations("settings.Sms");
  const { userId } = await PgSessions.get();
  const sdk = new Messaging(userId);
  const { data: smsProviders } = await sdk.getSmsProviders();

  if (!smsProviders) {
    return notFound();
  }
  return (
    <div>
      <h1>
        <span className="govie-heading-l">{t("title")}</span>
      </h1>

      <Link className="govie-link" href="sms/provider">
        {t("addProviderLink")}
      </Link>

      <hr />
      <SmsProviderTable providers={smsProviders} />
      <Link href="./" className="govie-back-link">
        {t("backLink")}
      </Link>
    </div>
  );
};
