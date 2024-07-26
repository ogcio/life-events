import { getTranslations } from "next-intl/server";
import React from "react";
import { UiUserInvitation } from "./page";

export default async (params: { users: UiUserInvitation[] | undefined }) => {
  const t = await getTranslations("Users");

  const foundUserProfile = t("table.userProfileStatuses.found");
  const notFoundUserProfile = t("table.userProfileStatuses.notFound");
  const statuses = {
    pending: t("table.invitationStatuses.pending"),
    accepted: t("table.invitationStatuses.accepted"),
    declined: t("table.invitationStatuses.declined"),
  };

  return (
    <>
      <table className="govie-table">
        <thead className="govie-table__head">
          <tr className="govie-table__row">
            <th scope="col" className="govie-table__header">
              {t("table.emailAddress")}
            </th>
            <th scope="col" className="govie-table__header">
              {t("table.publicIdentityId")}
            </th>
            <th scope="col" className="govie-table__header">
              {t("table.firstName")}
            </th>
            <th scope="col" className="govie-table__header">
              {t("table.lastName")}
            </th>
            <th scope="col" className="govie-table__header">
              {t("table.relatedUserProfileId")}
            </th>
            <th scope="col" className="govie-table__header">
              {t("table.invitationStatus")}
            </th>
          </tr>
        </thead>
        <tbody className="govie-table__body">
          {params.users?.map((record) => (
            <tr key={record.userId} className="govie-table__row">
              <th
                className="govie-table__cell govie-!-font-weight-regular"
                scope="row"
              >
                {record.emailAddress}
              </th>
              <th
                className="govie-table__cell govie-!-font-weight-regular"
                scope="row"
              >
                {record.details?.publicIdentityId}
              </th>
              <th
                className="govie-table__cell govie-!-font-weight-regular"
                scope="row"
              >
                {record.details?.firstName}
              </th>
              <th
                className="govie-table__cell govie-!-font-weight-regular"
                scope="row"
              >
                {record.details?.lastName}
              </th>
              <th
                className="govie-table__cell govie-!-font-weight-regular"
                scope="row"
              >
                {record.userProfileId && record.userProfileId.length > 0
                  ? foundUserProfile
                  : notFoundUserProfile}
              </th>
              <th
                className="govie-table__cell govie-!-font-weight-regular"
                scope="row"
              >
                {statuses[record.organisationInvitationStatus]}
              </th>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
