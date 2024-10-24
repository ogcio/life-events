import React from "react";
import { AuthenticationFactory } from "../../../../utils/authentication-factory";
import { getServerLogger } from "nextjs-logging-wrapper";
import { FileMetadata, FileOwner } from "../../../../types";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { redirect, RedirectType } from "next/navigation";
import searchUser from "./actions/searchUser";
import SearchBar from "./components/SearchBar";
import shareFileAction from "./actions/shareFile";
import SearchResultsTable from "./components/SearchResultsTable";
import SharingTables from "./components/SharingTables";
import FileDetails from "./components/FileDetails";
import removeFileSharing from "./actions/removeFileSharing";
import { ProfileAuthenticationFactory } from "../../../../utils/profile-authentication-factory";

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
  const uploadClient = await AuthenticationFactory.getUploadClient();
  const profileClient = await ProfileAuthenticationFactory.getProfileClient();

  const searchUserWithFileId = searchUser.bind(null, fileId);
  const shareFileWithFileId = shareFileAction.bind(null, fileId);
  const removeSharingWithFileId = removeFileSharing.bind(null, fileId);

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

    const { data, error: userError } = await profileClient.getUser(
      file.ownerId,
    );

    const { data: sharingData, error: sharingError } =
      await uploadClient.getFileSharings(file.id as string);

    if (sharingError || !sharingData) {
      getServerLogger().error(sharingError);
      return <FileError />;
    }

    if (sharingData) {
      const usersSharingFileMap = new Map<string, FileOwner>();

      await Promise.all(
        sharingData.map(async ({ userId }) => {
          const { data, error } = await profileClient.getUser(userId);
          if (error || !data) {
            getServerLogger().error(error);
            return undefined;
          }
          usersSharingFileMap.set(userId, data);
        }),
      );

      let usersSharing: FileOwner[] = Array.from(
        usersSharingFileMap.entries(),
      ).map(([userId, userData]) => ({ ...userData, id: userId }));
      file.sharedWith = usersSharing;
    }

    if (userError || !data) {
      getServerLogger().error(error);
      return <FileError />;
    }

    file.owner = data;
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
          <SearchBar handleSearch={searchUserWithFileId} searchString={email} />
          {/* Search results table  */}

          <SearchResultsTable users={users} shareFile={shareFileWithFileId} />

          {/* Sharing users table */}
          {file.sharedWith && (
            <SharingTables
              removeSharing={removeSharingWithFileId}
              users={file.sharedWith}
            />
          )}

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
