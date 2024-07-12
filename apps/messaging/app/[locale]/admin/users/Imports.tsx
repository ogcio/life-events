import dayjs from "dayjs";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Messaging } from "building-blocks-sdk";
import React from "react";
import { MessagingAuthenticationFactory } from "../../../utils/messaging";
import { notFound } from "next/navigation";

export default async () => {
  const t = await getTranslations("UsersImports");
  const { accessToken, organization } =
    await MessagingAuthenticationFactory.getPublicServant();
  if (!accessToken || !organization) {
    throw notFound();
  }
  const messagingClient = new Messaging(accessToken);
  const { data: imports } = await messagingClient.getUsersImports(
    organization.id,
  );

  return (
    <>
      <table className="govie-table">
        <thead className="govie-table__head">
          <tr className="govie-table__row">
            <th scope="col" className="govie-table__header">
              {t("table.importedAt")}
            </th>
            <th scope="col" className="govie-table__header">
              {t("table.importChannel")}
            </th>
            <th scope="col" className="govie-table__header">
              {t("table.actions.label")}
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
                {dayjs(record.importedAt).format("DD/MM/YYYY HH:mm:ss")}
              </th>
              <th
                className="govie-table__cell govie-!-font-weight-regular"
                scope="row"
              >
                {record.importChannel}
              </th>
              <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                <Link
                  className="govie-link govie-!-margin-right-3"
                  href={
                    new URL(
                      `/admin/users/imports/${record.importId}`,
                      process.env.HOST_URL,
                    ).href
                  }
                >
                  {t("table.actions.view")}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
