"use client";
import { useTranslations } from "next-intl";
import React from "react";
import { useFormState } from "react-dom";
import styles from "../page.module.css";

type TableProps = {
  users?: { firstname: string; lastname: string; id: string }[];
  shareFile: (userId: string, formData: FormData) => Promise<{ error: string }>;
};

export default ({ users, shareFile }: TableProps) => {
  const tTable = useTranslations("table");
  const tError = useTranslations("Errors");
  const [state, formAction] = useFormState(shareFile, { error: undefined });

  return (
    <div className="govie-form-group">
      <div style={{ margin: "0 0 5px 0" }} className="govie-label--s">
        {tTable("searchResultsCaption")}
      </div>

      {state?.error && (
        <p id="file-upload-error" className="govie-error-message">
          <span className="govie-visually-hidden">Error:</span>
          {tError(state.error)}
        </p>
      )}

      <table className="govie-table">
        <thead className="govie-table__head">
          <tr className="govie-table__row">
            <th scope="col" className="govie-table__header">
              {tTable("fullNameHeader")}
            </th>

            <th scope="col" className="govie-table__header">
              {tTable("actionsHeader")}
            </th>
          </tr>
        </thead>
        <tbody className="govie-table__body">
          {users?.map((foundUser) => (
            <tr className="govie-table__row" key={foundUser?.id}>
              <th className="govie-table__header govie-table__header--vertical-centralized govie-body-s">
                {foundUser?.firstname} {foundUser?.lastname}
              </th>

              <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                <form action={formAction}>
                  <input type="hidden" name="userId" value={foundUser.id} />

                  <div style={{ display: "flex", alignItems: "center" }}>
                    <button
                      className={`${styles.tableActionButton}`}
                      type="submit"
                    >
                      {tTable("shareButton")}
                    </button>
                  </div>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
