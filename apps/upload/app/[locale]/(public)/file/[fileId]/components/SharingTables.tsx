"use client";

import { useTranslations } from "next-intl";
import React from "react";
import type { FileOwner } from "../../../../../types";
import styles from "../page.module.css";

type SharingTableProps = {
  users: FileOwner[];
};

export default ({ users }: SharingTableProps) => {
  const t = useTranslations("table");

  return (
    <div className="govie-form-group">
      <div className="govie-form-group">
        <div style={{ margin: "0 0 5px 0" }} className="govie-label--s">
          {t("selectedUsersCaption")}
        </div>
        <table className="govie-table">
          <thead className="govie-table__head">
            <tr className="govie-table__row">
              <th scope="col" className="govie-table__header">
                {t("fullNameHeader")}
              </th>
              <th scope="col" className="govie-table__header">
                {t("emailHeader")}
              </th>
              <th scope="col" className="govie-table__header">
                {t("phoneHeader")}
              </th>
              <th scope="col" className="govie-table__header">
                {t("actionsHeader")}
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
                  <form>
                    <input type="hidden" name="recipient" value={user.id} />
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <button className={`${styles.tableActionButton}`}>
                        {t("removeButton")}
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
