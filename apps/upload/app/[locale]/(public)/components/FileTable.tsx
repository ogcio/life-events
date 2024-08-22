import type { FileMetadata } from "../../../types";
import ds from "design-system";
import styles from "./FileTable.module.scss";
import DeleteFile from "./DeleteFile";

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

const TableRow = ({ file, deleteFile }: TableRowProps) => {
  return (
    <tr className="govie-table__row">
      <th className="govie-table__header" scope="row">
        {!file.infected && !file.deleted && (
          <a href={`/api/file/${file.id}`} target="_blank">
            {file.filename}
          </a>
        )}
        {file.infected && (
          <span>
            {file.filename} -
            <span style={{ color: ds.colours.ogcio.red }}>
              <span className="govie-visually-hidden">Error:</span> The file is
              infected
            </span>
          </span>
        )}
      </th>
      <td className="govie-table__cell">{formatBytes(file.fileSize)}</td>
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

export default ({ deleteFile, files }: FileTableProps) => {
  return (
    <table className="govie-table">
      <caption className="govie-table__caption govie-table__caption--m">
        Files
      </caption>
      <thead className="govie-table__head">
        <tr className="govie-table__row">
          <th scope="col" className="govie-table__header">
            File
          </th>
          <th scope="col" className="govie-table__header">
            File size
          </th>
          <th scope="col" className="govie-table__header">
            Action
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
