import React from "react";
import { Heading, Label } from "@govie-ds/react";
import { AuthenticationFactory } from "../../utils/authentication-factory";
import Link from "next/link";
import { data } from "../../data/data";
import { translate } from "../../utils/locale";
import { getTranslations } from "next-intl/server";

export default async (props: { params: { locale: string } }) => {
  const tHome = await getTranslations("Home");
  const { user } = await AuthenticationFactory.getInstance().getContext();

  const tableData = await data.category.table();

  return (
    <>
      <Heading>
        {user.name} ({Object.keys(user.organizationData ?? {}).at(0)})
      </Heading>

      <table className="govie-table">
        <thead className="govie-table__head">
          <tr className="govie-table__row">
            <th scope="col" className="govie-table__header">
              {tHome("category")}
            </th>
            <th scope="col" className="govie-table__header">
              {tHome("subcategory")}
            </th>
            <th scope="col" className="govie-table__header"></th>
          </tr>
        </thead>
        <tbody className="govie-table__body">
          {tableData.map((row) => (
            <tr key={row.subcategoryId} className="govie-table__row">
              <th className="govie-table__header govie-table__header--vertical-centralized govie-body-s">
                {translate(row.categoryName, props.params.locale)}
              </th>
              <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                {translate(row.subcategoryName, props.params.locale)}
              </td>
              <td className="govie-table__cell govie-body-s">
                <a
                  className="govie-link"
                  href={`/${props.params.locale}/subcategories/${row.subcategoryId}`}
                >
                  {tHome("edit")}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
