import React from "react";
import ds from "design-system";

import type { FileMetadata } from "../../../../types";
import DeleteFile from "../DeleteFile";
import styles from "./FileTableRow.module.scss";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import formatBytes from "../../utils/formatBytes";

type TableRowProps = {
  file: FileMetadata;
  deleteFile: (formData: FormData) => Promise<{ error: string }>;
};

const TableRow = async ({ file, deleteFile }: TableRowProps) => {
  const tTable = await getTranslations("Upload.table.data");
  const cellClasses = `govie-table__cell ${styles["align-middle"]}`;

  return (
    <tr className="govie-table__row">
      <th
        className={`govie-table__header ${styles["align-middle"]}`}
        scope="row"
      >
        {!file.infected && !file.deleted && (
          <a href={`/api/file/${file.id}`} target="_blank">
            {file.fileName}
          </a>
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
        <DeleteFile deleteFile={deleteFile} id={file.id as string} />
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
    </tr>
  );
};

export default TableRow;
