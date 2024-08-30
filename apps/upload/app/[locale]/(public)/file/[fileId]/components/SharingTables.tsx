"use client";

import { useTranslations } from "next-intl";
import React from "react";
import { useFormState } from "react-dom";
import type { FileOwner } from "../../../../../types";
import styles from "../page.module.css";

type SharingTableProps = {
  users: FileOwner[];
  removeSharing: (
    userId: string,
    formData: FormData,
  ) => Promise<{ error: string }>;
};

export default ({ users, removeSharing }: SharingTableProps) => {
  const tTable = useTranslations("table");
  const tError = useTranslations("Errors");
  const [state, formAction] = useFormState(removeSharing, { error: undefined });

  return (
    <div className="govie-form-group">
      <div className="govie-form-group">
        <div style={{ margin: "0 0 5px 0" }} className="govie-label--s">
          {tTable("selectedUsersCaption")}
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
                {tTable("emailHeader")}
              </th>
              <th scope="col" className="govie-table__header">
                {tTable("phoneHeader")}
              </th>
              <th scope="col" className="govie-table__header">
                {tTable("actionsHeader")}
              </th>
            </tr>
          </thead>
          <tbody className="govie-table__body">
            {users?.map((user) => (
              <tr className="govie-table__row" key={user.id}>
                <th className="govie-table__header govie-table__header--vertical-centralized govie-body-s">
                  {user.firstName} {user.lastName}
                </th>
                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  {user.email}
                </td>
                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  {user.phone}
                </td>
                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  <form action={formAction}>
                    <input type="hidden" name="userId" value={user.id} />
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <button className={`${styles.tableActionButton}`}>
                        {tTable("removeButton")}
                      </button>
                    </div>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
