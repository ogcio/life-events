import DeleteFile from "./DeleteFile";

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1000;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

type File = {
  id: string;
  url: string;
  key: string;
  size: number;
};

type TableRowProps = {
  file: File;
  deleteFile: (formData: FormData) => Promise<{ error: string }>;
  token: string;
};

const TableRow = ({ file, deleteFile, token }: TableRowProps) => {
  return (
    <tr className="govie-table__row">
      <th className="govie-table__header" scope="row">
        <a href={`/api/file/${file.id}`} target="_blank">
          {file.key}
        </a>
      </th>
      <td className="govie-table__cell">{formatBytes(file.size)}</td>
      <td className="govie-table__cell">
        <DeleteFile deleteFile={deleteFile} id={file.id} />
      </td>
    </tr>
  );
};

type FileTableProps = {
  files: File[];
  deleteFile: (formData: FormData) => Promise<{ error: string }>;
  token: string;
};

export default ({ deleteFile, files, token }: FileTableProps) => {
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
          <TableRow
            key={file.id}
            file={file}
            deleteFile={deleteFile}
            token={token}
          />
        ))}
      </tbody>
    </table>
  );
};
