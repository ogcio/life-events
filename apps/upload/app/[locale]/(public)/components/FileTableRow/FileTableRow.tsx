import ds from "design-system";

import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { FileMetadata } from "../../../../types";
import formatBytes from "../../utils/formatBytes";
import DeleteFile from "../DeleteFile";
import styles from "./FileTableRow.module.scss";
import scheduleFileForDeletion from "../../actions/scheduleFileForDeletion";

type TableRowProps = {
  file: FileMetadata;
  isPublicServant: boolean;
};

const TableRow = async ({ file, isPublicServant }: TableRowProps) => {
  const tTable = await getTranslations("Upload.table.data");
  const cellClasses = `govie-table__cell ${styles["align-middle"]}`;

  return (
    <tr className="govie-table__row">
      <th
        className={`govie-table__header ${styles["align-middle"]}`}
        scope="row"
      >
        {!file.infected && !file.deleted && (
          <Link href={`/api/file/${file.id}`} target="_blank">
            {file.fileName}
          </Link>
        )}
        {file.infected && (
          <span>
            {file.fileName} -
            <span style={{ color: ds.colours.ogcio.red }}>
              <span className="govie-visually-hidden">Error:</span>
              {tTable("infected")}
            </span>
          </span>
        )}
      </th>
      <td className={cellClasses}>{formatBytes(file.fileSize)}</td>
      <td className={cellClasses}>{file?.owner?.email}</td>
      <td className={cellClasses}>
        {file.expiresAt && new Date(file.expiresAt).toLocaleString()}
      </td>
      {isPublicServant && (
        <td className={cellClasses}>
          <DeleteFile
            scheduleFileForDeletion={scheduleFileForDeletion}
            id={file.id as string}
          />
          <Link href={`/file/${file.id}`}>
            <span data-module="govie-tooltip">
              <button
                data-module="govie-icon-button"
                className="govie-icon-button"
              >
                <ds.Icon icon="send-a-message" color={ds.colours.ogcio.black} />

                <span className="govie-visually-hidden">Share</span>
              </button>
              <span className="govie-tooltip govie-tooltip--top">Share</span>
            </span>
          </Link>
        </td>
      )}
    </tr>
  );
};

export default TableRow;
