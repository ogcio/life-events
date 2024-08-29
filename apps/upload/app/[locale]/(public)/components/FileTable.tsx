import { getTranslations } from "next-intl/server";
import type { FileMetadata } from "../../../types";
import styles from "./FileTable.module.scss";
import TableRow from "./FileTableRow/FileTableRow";

type FileTableProps = {
  files: FileMetadata[];
  deleteFile: (formData: FormData) => Promise<{ error: string }>;
};

export default async ({ deleteFile, files }: FileTableProps) => {
  const tTable = await getTranslations("Upload.table");
  return (
    <table className="govie-table">
      <caption className="govie-table__caption govie-table__caption--m">
        {tTable("caption")}
      </caption>
      <thead className="govie-table__head">
        <tr className="govie-table__row">
          <th scope="col" className="govie-table__header">
            {tTable("header.file")}
          </th>
          <th scope="col" className="govie-table__header">
            {tTable("header.fileSize")}
          </th>
          <th scope="col" className="govie-table__header">
            {tTable("header.uploadedBy")}
          </th>
          <th scope="col" className="govie-table__header">
            {tTable("header.action")}
          </th>
        </tr>
      </thead>
      <tbody className="govie-table__body">
        {files.map((file) => (
          <TableRow key={file.id} file={file} deleteFile={deleteFile} />
        ))}
      </tbody>
    </table>
  );
};
