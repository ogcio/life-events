import { getServerLogger } from "nextjs-logging-wrapper";
import { AuthenticationFactory } from "../../utils/authentication-factory";
import FileUpload from "./components/FileUpload";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import uploadFile from "./actions/uploadFile";

import FileTable from "./components/FileTable";
import { FileMetadata } from "../../types";
import { ProfileAuthenticationFactory } from "../../utils/profile-authentication-factory";

type Props = {
  params: {
    locale: string;
  };
};

export default async (props: Props) => {
  const t = await getTranslations("Upload");

  const {
    isPublicServant,
    organization,
    user: { id: userId },
  } = await AuthenticationFactory.getInstance().getContext();

  let files: FileMetadata[] | undefined;

  const uploadClient = await AuthenticationFactory.getUploadClient();
  const profileClient = await ProfileAuthenticationFactory.getProfileClient();

  let organizationId: string | undefined;
  if (organization) {
    organizationId = organization.id;
  }

  try {
    const { data: files_, error } = await uploadClient.getFilesMetadata({
      organizationId,
      userId,
    });
    if (error) {
      getServerLogger().error(error);
      return (
        <section>
          <h3 className="govie-heading-l">Error retrieving files</h3>
        </section>
      );
    }

    files = files_;

    const ownerData = await Promise.all(
      files.map(({ ownerId }) => profileClient.getUser(ownerId)),
    );

    console.log({ ownerData: ownerData[0].error });

    console.log({ files });
  } catch (error) {
    getServerLogger().error(error);
    return (
      <section>
        <h3 className="govie-heading-l">{t("Errors.retrievalError")}</h3>
      </section>
    );
  }

  const messages = await getMessages({ locale: props.params.locale });
  const uploadMessages = messages.Upload as AbstractIntlMessages;

  return (
    <NextIntlClientProvider messages={uploadMessages}>
      <section>
        <h3 className="govie-heading-l">{t("title")}</h3>

        {files?.length === 0 && (
          <h3 className="govie-heading-m">{t("noFiles")}</h3>
        )}
        <div>
          {files && (
            <FileTable isPublicServant={isPublicServant} files={files} />
          )}
        </div>

        {isPublicServant && <FileUpload uploadFile={uploadFile} />}
      </section>
    </NextIntlClientProvider>
  );
};
