import { getCommonLogger } from "nextjs-logging-wrapper";
import { AuthenticationFactory } from "../../utils/authentication-factory";

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

  return (
    <section>
      <h3 className="govie-heading-l">welcome to upload app</h3>

      <div>
        <ul>
          {files && files.map(({ key, size, url }) => <li key={key}>{key}</li>)}
        </ul>
      </div>
    </section>
  );
};
