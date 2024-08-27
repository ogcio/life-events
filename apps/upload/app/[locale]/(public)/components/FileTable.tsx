import type { FileMetadata } from "../../../types";
import ds from "design-system";
import styles from "./FileTable.module.scss";
import DeleteFile from "./DeleteFile";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1000;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

type TableRowProps = {
  file: FileMetadata;
  deleteFile: (formData: FormData) => Promise<{ error: string }>;
};

const TableRow = async ({ file, deleteFile }: TableRowProps) => {
  const tTable = await getTranslations("Upload.table.data");

  return (
    <tr className="govie-table__row">
      <th className="govie-table__header" scope="row">
        {!file.infected && !file.deleted && (
          <a href={`/api/file/${file.id}`} target="_blank">
            {file.fileName}
          </a>
        )}
        {file.infected && (
          <span>
            {file.fileName} -
            <span style={{ color: ds.colours.ogcio.red }}>
              <span className="govie-visually-hidden">Error:</span>{" "}
              {tTable("infected")}
            </span>
          </span>
        )}
      </th>
      <td className="govie-table__cell">{formatBytes(file.fileSize)}</td>
      <td className="govie-table__cell">{file.owner.email}</td>
      <td className="govie-table__cell">
        <DeleteFile deleteFile={deleteFile} id={file.id as string} />
      </td>
    </tr>
  );
};

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
