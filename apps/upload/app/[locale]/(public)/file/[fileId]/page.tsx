import React from "react";
import ds from "design-system";
import { AuthenticationFactory } from "../../../../utils/authentication-factory";
import { getCommonLogger } from "nextjs-logging-wrapper";
import { FileMetadata } from "../../../../types";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import styles from "./page.module.css";
import { redirect, RedirectType } from "next/navigation";
import handleSearch from "./actions/handleSearch";
import SearchBar from "./components/SearchBar";
import { revalidatePath } from "next/cache";
import FileDetails from "./components/FileDetails";

type PageProps = {
  params: { fileId: string; locale: string };
  searchParams: { email: string };
};

const goBack = async () => {
  "use server";
  return redirect("/", RedirectType.replace);
};

const FileError = async () => {
  const t = await getTranslations("File.Errors");

  return (
    <section>
      <h3 className="govie-heading-l">{t("retrievalError")}</h3>
    </section>
  );
};

export default async ({ params, searchParams }: PageProps) => {
  const { fileId } = params;

  const { email } = searchParams;

  const t = await getTranslations("File");
  const tTable = await getTranslations("File.table");
  const uploadClient = await AuthenticationFactory.getUploadClient();
  const profileClient = await AuthenticationFactory.getProfileClient();

  const handlesSearchWithId = handleSearch.bind(null, fileId);

  let users:
    | {
        id: string;
        firstname: string;
        lastname: string;
        matchQuality: "exact" | "approximate";
      }[]
    | undefined;
  try {
    const { data, error } = await profileClient.findUser({
      email,
    });
    users = data ? [data] : undefined;

    if (error) {
      getCommonLogger().error(error);
      return <FileError />;
    }
  } catch (error) {
    getCommonLogger().error(error);
    return <FileError />;
  }

  let file: FileMetadata;
  try {
    const { data: file_, error } = await uploadClient.getFileMetadata(fileId);
    if (error || !file_) {
      getCommonLogger().error(error);
      return <FileError />;
    }

    file = file_;
  } catch (error) {
    getCommonLogger().error(error);
    return <FileError />;
  }

  const messages = await getMessages({ locale: params.locale });
  const uploadMessages = messages.File as AbstractIntlMessages;

  return (
    <NextIntlClientProvider messages={uploadMessages}>
      <section>
        <div className="govie-grid-column-two-thirds-from-desktop">
          <h3>
            <span style={{ margin: "unset" }} className="govie-heading-s">
              {t("title")}
            </span>
          </h3>

          <FileDetails file={file} />

          <div style={{ margin: "0 0 5px 0" }} className="govie-label--s">
            {t("shareFileCaption")}
          </div>
          {/* Search bar */}
          <SearchBar handleSearch={handlesSearchWithId} searchString={email} />
          {/* Search results table  */}
          <div className="govie-form-group">
            <div style={{ margin: "0 0 5px 0" }} className="govie-label--s">
              {tTable("searchResultsCaption")}
            </div>
            <table className="govie-table">
              <thead className="govie-table__head">
                <tr className="govie-table__row">
                  <th scope="col" className="govie-table__header">
                    {tTable("fullNameHeader")}
                  </th>

                  <th scope="col" className="govie-table__header">
                    {tTable("actionsHeader")}
                  </th>
                </tr>
              </thead>
              <tbody className="govie-table__body">
                {users?.map((foundUser) => (
                  <tr className="govie-table__row" key={foundUser?.id}>
                    <th className="govie-table__header govie-table__header--vertical-centralized govie-body-s">
                      {foundUser?.firstname} {foundUser?.lastname}
                    </th>

                    <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                      <form>
                        <input
                          type="hidden"
                          name="recipient"
                          value={foundUser?.id}
                        />

                        <div style={{ display: "flex", alignItems: "center" }}>
                          <button className={`${styles.tableActionButton}`}>
                            {tTable("shareButton")}
                          </button>
                        </div>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sharing users table */}
          <div className="govie-form-group">
            <div className="govie-form-group">
              <div style={{ margin: "0 0 5px 0" }} className="govie-label--s">
                {tTable("selectedUsersCaption")}
              </div>
              <table className="govie-table">
                <thead className="govie-table__head">
                  <tr className="govie-table__row">
                    <th scope="col" className="govie-table__header">
                      {tTable("fullNameHeader")}
                    </th>
                    <th scope="col" className="govie-table__header">
                      {tTable("emailHeader")}
                    </th>
                    <th scope="col" className="govie-table__header">
                      {tTable("phoneHeader")}
                    </th>
                    <th scope="col" className="govie-table__header">
                      {tTable("actionsHeader")}
                    </th>
                  </tr>
                </thead>
                <tbody className="govie-table__body">
                  {/* {addedUsers?.map((foundUser) => (
                <tr className="govie-table__row" key={foundUser.id}>
                  <th className="govie-table__header govie-table__header--vertical-centralized govie-body-s">
                    {foundUser.firstName} {foundUser.lastName}
                  </th>
                  <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                    {foundUser.emailAddress}
                  </td>
                  <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                    {foundUser.phoneNumber}
                  </td>
                  <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                    <form action={removeRecipientAction}>
                      <input
                        type="hidden"
                        name="recipient"
                        value={foundUser.id}
                      />
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <button className={`${styles.tableActionButton}`}>
                          {t("searchTable.removeButton")}
                        </button>
                      </div>
                    </form>
                  </td>
                </tr>
              ))} */}
                </tbody>
              </table>
            </div>
          </div>

          <form action={goBack}>
            <button
              type="submit"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                margin: "unset",
              }}
              className="govie-back-link"
            >
              {t("backLink")}
            </button>
          </form>
        </div>
      </section>
    </NextIntlClientProvider>
  );
};
