import { PgSessions } from "auth/sessions";
import dayjs from "dayjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import ds from "design-system";
import { Messaging } from "building-blocks-sdk";
import React from "react";

export default async (props: { searchParams: any }) => {
  const t = await getTranslations("UsersImports");
  const { userId } = await PgSessions.get();
  const messagingClient = new Messaging(userId);
  const { data: organisationId } =
    await messagingClient.getMockOrganisationId();
  const { data: imports } =
    await messagingClient.getUsersImports(organisationId);

  return (
    <>
      <h1 className="govie-heading-l">{t("header")}</h1>
      <table className="govie-table">
        <thead className="govie-table__head">
          <tr className="govie-table__row">
            <th scope="col" className="govie-table__header">
              {t("table.importedAt")}
            </th>
            <th scope="col" className="govie-table__header">
              {t("table.importId")}
            </th>
            <th scope="col" className="govie-table__header">
              {t("table.importChannel")}
            </th>
          </tr>
        </thead>
        <tbody className="govie-table__body">
          {imports?.map((record) => (
            <tr key={record.importId} className="govie-table__row">
              <th
                className="govie-table__cell govie-!-font-weight-regular"
                scope="row"
              >
                {dayjs(record.importedAt).format("DD/MM/YYYY")}
              </th>
              <th
                className="govie-table__cell govie-!-font-weight-regular"
                scope="row"
              >
                <Link
                  href={
                    new URL(
                      `/admin/users/imports/${record.importId}`,
                      process.env.HOST_URL,
                    ).href
                  }
                >
                  {record.importId}
                </Link>
              </th>
              <th
                className="govie-table__cell govie-!-font-weight-regular"
                scope="row"
              >
                {record.importChannel}
              </th>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
