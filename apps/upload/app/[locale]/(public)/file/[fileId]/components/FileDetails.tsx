import { getTranslations } from "next-intl/server";
import { FileMetadata } from "../../../../../types";
import formatBytes from "../../../utils/formatBytes";

type FileDetailProps = {
  file: FileMetadata;
};

export default async ({ file }: FileDetailProps) => {
  const t = await getTranslations("File.details");

  return (
    <dl className="govie-summary-list">
      <div className="govie-summary-list__row">
        <dt className="govie-summary-list__key">{t("name")}</dt>
        <dd className="govie-summary-list__value">{file.fileName}</dd>
      </div>
      <div className="govie-summary-list__row">
        <dt className="govie-summary-list__key">{t("fileSize")}</dt>
        <dd className="govie-summary-list__value">
          {formatBytes(file.fileSize)}
        </dd>
      </div>
      <div className="govie-summary-list__row">
        <dt className="govie-summary-list__key">{t("createdAt")}</dt>
        <dd className="govie-summary-list__value">
          {new Date(file.createdAt).toLocaleDateString()}
        </dd>
      </div>
      <div className="govie-summary-list__row">
        <dt className="govie-summary-list__key">{t("fileType")}</dt>
        <dd className="govie-summary-list__value">{file.mimeType}</dd>
      </div>
      {file.owner && (
        <div className="govie-summary-list__row">
          <dt className="govie-summary-list__key">{t("uploadedBy")}</dt>
          <dd className="govie-summary-list__value">{`${file.owner.firstName} ${file.owner.lastName} (${file.owner.email})`}</dd>
        </div>
      )}
    </dl>
  );
};
