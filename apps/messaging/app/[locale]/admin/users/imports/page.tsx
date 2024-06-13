import { PgSessions } from "auth/sessions";
import dayjs from "dayjs";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Messaging } from "building-blocks-sdk";
import React from "react";
import { revalidatePath } from "next/cache";
import { usersImports } from "../../../../utils/routes";
import { temporaryMockUtils } from "messages";
import FlexMenuWrapper from "../../PageWithMenuFlexWrapper";

type FormErrors = Parameters<typeof temporaryMockUtils.createErrors>[0];

const CSV_FILE_FIELD = "csv-file";

export default async () => {
  async function upload(formData: FormData) {
    "use server";
    const { userId } = await PgSessions.get();
    const file = formData.get(CSV_FILE_FIELD);
    const organisationId = formData.get("organisationId");

    const toStoreErrors: FormErrors = [];
    const castedFile = file ? (file as File) : null;
    if (file && castedFile && (castedFile.size ?? 0) > 0) {
      const uploadClient = new Messaging(userId);
      await uploadClient.importUsersCsv(file as File);

      revalidatePath(usersImports.url);
      return;
    }
    toStoreErrors.push({
      errorValue: "",
      field: CSV_FILE_FIELD,
      messageKey: "empty",
    });

    await temporaryMockUtils.createErrors(
      toStoreErrors,
      userId,
      `${organisationId}_imports`,
    );
    return revalidatePath("/");
  }

  const [t, tError] = await Promise.all([
    getTranslations("UsersImports"),
    getTranslations("formErrors"),
  ]);
  const { userId } = await PgSessions.get();
  const messagingClient = new Messaging(userId);
  const { data: organisationId } =
    await messagingClient.getMockOrganisationId();
  const { data: imports } =
    await messagingClient.getUsersImports(organisationId);

  const formErrors = await temporaryMockUtils.getErrors(
    userId,
    `${organisationId}_imports`,
  );
  const csvErrors = formErrors.filter(
    (value) => value.field === CSV_FILE_FIELD,
  );
  const csvError = csvErrors.length === 0 ? null : csvErrors[0];

  return (
    <FlexMenuWrapper>
      <h1 className="govie-heading-l">{t("header")}</h1>
      <Link href="/api/users-csv" target="_blank">
        {t("downloadFileBtn")}
      </Link>
      <form action={upload}>
        <input name="organisationId" value={organisationId} type="hidden" />
        <div
          className={
            csvError
              ? "govie-form-group govie-form-group--error"
              : "govie-form-group"
          }
        >
          <label className="govie-body " htmlFor="file-upload">
            {t("uploadFileBtn")}
          </label>
          <div id="csv-file-hint" className="govie-hint"></div>
          {csvError && (
            <p id="input-field-error" className="govie-error-message">
              <span className="govie-visually-hidden">Error:</span>
              {tError(csvError.messageKey, {
                field: tError("fields.file"),
                indArticleCheck: "",
              })}
            </p>
          )}
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
                {dayjs(record.importedAt).format("DD/MM/YYYY HH:mm:ss")}
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
    </FlexMenuWrapper>
  );
};
