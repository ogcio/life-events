import { PgSessions } from "auth/sessions";
import { Messaging } from "building-blocks-sdk";
import { getTranslations } from "next-intl/server";

export default async () => {
  const t = await getTranslations("userSettings.Organisations");
  const { userId } = await PgSessions.get();
  console.log({ userId });
  const { data } = await new Messaging(userId).getOrganisationInvitations();

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
              {invitation.organisationId}
            </th>
            <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
              {invitation.organisationInvitationStatus}
            </td>
            <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
              {invitation.organisationPreferredTransports?.join(", ")}
            </td>
            <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
              <div style={{ display: "flex", alignItems: "center" }}>
                {/* <Link
                  className="govie-link govie-!-margin-right-3"
                  href={(() => {
                    const url = new URL(
                      `${providerRoutes.url}/email`,
                      process.env.HOST_URL,
                    );
                    url.searchParams.append("id", provider.id);
                    return url.href;
                  })()}
                >
                  {t("editLink")}
                </Link>
                <Link
                  className="govie-link govie-!-margin-right-3"
                  href={(() => {
                    const url = new URL(
                      providerRoutes.url,
                      process.env.HOST_URL,
                    );
                    url.searchParams.append(searchKeyDeleteId, provider.id);
                    url.searchParams.append(
                      searchKeyProvider,
                      searchValueEmail,
                    );
                    return url.href;
                  })()}
                >
                  {t("deleteButton")}
                </Link> */}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
