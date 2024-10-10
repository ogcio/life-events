import { getServerLogger } from "nextjs-logging-wrapper";
import { AuthenticationFactory } from "../../utils/authentication-factory";
import FileUpload from "./components/FileUpload";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import uploadFile from "./actions/uploadFile";

import FileTable from "./components/FileTable";
import { FileMetadata } from "../../types";

type Props = {
  params: {
    locale: string;
  };
};

export default async (props: Props) => {
  const t = await getTranslations("Upload");

  const { isPublicServant } =
    await AuthenticationFactory.getInstance().getContext();

  const uploadClient = await AuthenticationFactory.getUploadClient();

  let files: FileMetadata[] | undefined;

  try {
    const { data: files_, error } = await uploadClient.getFilesMetadata();
    if (error) {
      getServerLogger().error(error);
      return (
        <section>
          <h3 className="govie-heading-l">Error retrieving files</h3>
        </section>
      );
    }

    files = files_;
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
