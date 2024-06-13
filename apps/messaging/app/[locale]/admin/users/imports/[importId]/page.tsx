import { PgSessions } from "auth/sessions";
import { getTranslations } from "next-intl/server";
import { Messaging } from "building-blocks-sdk";
import React from "react";
import { notFound } from "next/navigation";
import FlexMenuWrapper from "../../../PageWithMenuFlexWrapper";
import dayjs from "dayjs";
import Link from "next/link";

export default async (props: { params: { importId: string } }) => {
  const [t, tCommons] = await Promise.all([
    getTranslations("UsersImport"),
    getTranslations("Commons"),
  ]);
  const { userId } = await PgSessions.get();
  const messagingClient = new Messaging(userId);
  const { data: organisationId } =
    await messagingClient.getMockOrganisationId();
  const { data: userImport, error } = await messagingClient.getUsersImport(
    props.params.importId,
    organisationId,
    true,
  );

  if (error || !userImport) {
    throw notFound();
  }

  return (
    <FlexMenuWrapper>
      <h1 className="govie-heading-l">{userImport.importId}</h1>
      <p className="govie-body">
        {dayjs(userImport.importedAt).format("DD/MM/YYYY HH:mm:ss")}
      </p>
      <table className="govie-table">
        <thead className="govie-table__head">
          <tr className="govie-table__row">
            <th scope="col" className="govie-table__header">
              {t("table.importIndex")}
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
              {t("table.birthDate")}
            </th>
            <th scope="col" className="govie-table__header">
              {t("table.relatedUserId")}
            </th>
            <th scope="col" className="govie-table__header">
              {t("table.relatedUserProfileId")}
            </th>
          </tr>
        </thead>
        <tbody className="govie-table__body">
          {userImport.usersData.map((record) => (
            <tr key={record.relatedUserId} className="govie-table__row">
              <th
                className="govie-table__cell govie-!-font-weight-regular"
                scope="row"
              >
                {record.importIndex}
              </th>
              <th
                className="govie-table__cell govie-!-font-weight-regular"
                scope="row"
              >
                {record.publicIdentityId}
              </th>
              <th
                className="govie-table__cell govie-!-font-weight-regular"
                scope="row"
              >
                {record.firstName}
              </th>
              <th
                className="govie-table__cell govie-!-font-weight-regular"
                scope="row"
              >
                {record.lastName}
              </th>
              <th
                className="govie-table__cell govie-!-font-weight-regular"
                scope="row"
              >
                {record.birthDate}
              </th>
              <th
                className="govie-table__cell govie-!-font-weight-regular"
                scope="row"
              >
                {record.relatedUserId}
              </th>
              <th
                className="govie-table__cell govie-!-font-weight-regular"
                scope="row"
              >
                {record.relatedUserProfileId ?? "NOT FOUND"}
              </th>
            </tr>
          ))}
        </tbody>
      </table>
      <Link className="govie-back-link" href="./">
        {tCommons("backLink")}
      </Link>
    </FlexMenuWrapper>
  );
};
