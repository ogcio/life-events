import { getCommonLogger } from "nextjs-logging-wrapper";
import { AuthenticationFactory } from "../../utils/authentication-factory";
import FileUpload from "./components/FileUpload";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

type Props = {
  params: {
    locale: string;
  };
};

export default async (props: Props) => {
  const uploadClient = await AuthenticationFactory.getUploadClient();

  const { data: files, error } = await uploadClient.getFiles();

  if (error) {
    getCommonLogger().error(error);
    return (
      <section>
        <h3 className="govie-heading-l">Error retrieving files</h3>
      </section>
    );
  }

  const messages = await getMessages({ locale: props.params.locale });
  const uploadMessages = messages.Upload as AbstractIntlMessages;

  return (
    <section>
      <h3 className="govie-heading-l">welcome to upload app</h3>

      {files?.length === 0 && (
        <h3 className="govie-heading-m">No files uploaded</h3>
      )}
      <div>
        {files && (
          <ul>
            {files.map(({ key, size, url }) => (
              <li key={key}>{key}</li>
            ))}
          </ul>
        )}
      </div>
      <NextIntlClientProvider messages={uploadMessages}>
        <FileUpload />
      </NextIntlClientProvider>
    </section>
  );
};
