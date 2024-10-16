import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { userOrganisationsRoutes } from "../../utils/routes";
import { AuthenticationFactory } from "../../utils/authentication-factory";

export default async () => {
  const t = await getTranslations("userSettings.Organisations");
  const { data } = await (
    await AuthenticationFactory.getMessagingClient()
  ).getOrganisationsSettings();

  return (
    <table className="govie-table">
      <thead className="govie-table__head">
        <tr className="govie-table__row">
          <th scope="col" className="govie-table__header">
            {t("organisationTableHeader")}
          </th>
          <th scope="col" className="govie-table__header">
            {t("statusTableHeader")}
          </th>
          <th scope="col" className="govie-table__header">
            {t("transportsTableHeader")}
          </th>
          <th scope="col" className="govie-table__header">
            {t("actionTableHeader")}
          </th>
        </tr>
      </thead>
      <tbody className="govie-table__body">
        {data?.map((organisationSetting) => (
          <tr className="govie-table__row" key={organisationSetting.id}>
            <th className="govie-table__header govie-table__header--vertical-centralized govie-body-s">
              {organisationSetting.organisationId}
            </th>
            <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
              {organisationSetting.organisationInvitationStatus}
            </td>
            <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
              {organisationSetting.organisationPreferredTransports?.join(", ")}
            </td>
            <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
              <div style={{ display: "flex", alignItems: "center" }}>
                <Link
                  className="govie-link govie-!-margin-right-3"
                  href={(() => {
                    const url = new URL(
                      `${userOrganisationsRoutes.url}/${organisationSetting.id}`,
                      process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT,
                    );
                    return url.href;
                  })()}
                >
                  {t("editLink")}
                </Link>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
