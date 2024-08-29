import React from "react";
import { AuthenticationFactory } from "../../../../utils/authentication-factory";
import { getServerLogger } from "nextjs-logging-wrapper";
import { FileMetadata } from "../../../../types";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import styles from "./page.module.css";
import { redirect, RedirectType } from "next/navigation";
import handleSearch from "./actions/handleSearch";
import SearchBar from "./components/SearchBar";
import shareFileAction from "./actions/shareFile";
import SearchResultsTable from "./components/SearchResultsTable";
import SharingTables from "./components/SharingTables";
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
  const shareFileWithId = shareFileAction.bind(null, fileId);

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
      getServerLogger().error(error);
      return <FileError />;
    }
  } catch (error) {
    getServerLogger().error(error);
    return <FileError />;
  }

  let file: FileMetadata;
  try {
    const { data: file_, error } = await uploadClient.getFileMetadata(fileId);
    if (error || !file_) {
      getServerLogger().error(error);
      return <FileError />;
    }

    file = file_;
  } catch (error) {
    getServerLogger().error(error);
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

          <SearchResultsTable users={users} shareFile={shareFileWithId} />

          {/* Sharing users table */}
          {file.sharedWith && <SharingTables users={file.sharedWith} />}

          <div style={{ marginTop: "30px", marginBottom: "30px" }}>
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
        </div>
      </section>
    </NextIntlClientProvider>
  );
};
