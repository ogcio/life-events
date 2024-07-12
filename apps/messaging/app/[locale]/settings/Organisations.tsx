import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { userOrganisationsRoutes } from "../../utils/routes";
import { AuthenticationFactory } from "../../utils/authentication-factory";

export default async () => {
  const t = await getTranslations("userSettings.Organisations");
  const { data } = await (
    await AuthenticationFactory.getMessagingClient()
  ).getOrganisationInvitations();

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
        {data?.map((invitation) => (
          <tr className="govie-table__row" key={invitation.organisationId}>
            <th className="govie-table__header govie-table__header--vertical-centralized govie-body-s">
              {/* {invitation.organisationId} At the moment we want to show "Life Events" as fixed value*/}
              Life Events
            </th>
            <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
              {invitation.organisationInvitationStatus}
            </td>
            <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
              {invitation.organisationPreferredTransports?.join(", ")}
            </td>
            <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
              <div style={{ display: "flex", alignItems: "center" }}>
                <Link
                  className="govie-link govie-!-margin-right-3"
                  href={(() => {
                    const url = new URL(
                      `${userOrganisationsRoutes.url}/${invitation.organisationId}`,
                      process.env.HOST_URL,
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
