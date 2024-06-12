import { PgSessions } from "auth/sessions";
import dayjs from "dayjs";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Messaging } from "building-blocks-sdk";
import React from "react";
import { revalidatePath } from "next/cache";
import { usersImports } from "../../../../utils/routes";

export default async () => {
  const t = await getTranslations("UsersImports");
  const { userId } = await PgSessions.get();
  const messagingClient = new Messaging(userId);
  const { data: organisationId } =
    await messagingClient.getMockOrganisationId();
  const { data: imports } =
    await messagingClient.getUsersImports(organisationId);

  async function upload(formData: FormData) {
    "use server";
    const file = formData.get("csv-file");
    if (!file) {
      return;
    }

    const uploadClient = new Messaging(userId);
    await uploadClient.importUsersCsv(file as File);

    revalidatePath(usersImports.url);
  }

  return (
    <>
      <h1 className="govie-heading-l">{t("header")}</h1>
      <form action={upload}>
        <div className="govie-form-group">
          <label className="govie-body " htmlFor="file-upload">
            {t("uploadFileBtn")}
          </label>
          <div id="csv-file-hint" className="govie-hint"></div>
          <input
            className="govie-file-upload"
            id="csv-file"
            name="csv-file"
            type="file"
            aria-describedby="csv-file-hint"
            content="Choose file"
            accept="text/csv"
          />
        </div>
        <button type="submit" className="govie-button">
          {t("confirmUploadBtn")}
        </button>
      </form>
      <Link href="/api/users-csv" target="_blank">
        {t("downloadFileBtn")}
      </Link>
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
