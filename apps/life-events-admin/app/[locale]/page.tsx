import React from "react";
import {
  Heading,
  Label,
  Paragraph,
  TabItem,
  TabList,
  Tabs,
} from "@govie-ds/react";
import { AuthenticationFactory } from "../../utils/authentication-factory";
import Link from "next/link";
import { CategoryTableModel, data } from "../../data/data";
import { translate } from "../../utils/locale";
import { getTranslations } from "next-intl/server";

export default async (props: { params: { locale: string } }) => {
  const tTable = await getTranslations("Table");
  const { user } = await AuthenticationFactory.getInstance().getContext();

  const tableData = await data.category.table();

  /**
   * Ha en tabell per cat, med subcat och actions (edit) "add sub" action for cat
   * Ordna cats som UI via backend
   *
   * Varje /subcat/:id
   * Subcat form
   * Recurse table med subcat och actions (edit, delete) "add sub" action for subcat
   */

  console.log(tableData);
  const categoryGroup: Record<string, (typeof tableData)[0][]> =
    tableData.reduce((groups, model) => {
      groups[model.categoryId]?.push(model) ??
        (groups[model.categoryId] = [model]);
      return groups;
    }, {});

  return (
    <>
      <Heading>
        {user.name} ({Object.keys(user.organizationData ?? {}).at(0)})
      </Heading>

      {Object.keys(categoryGroup).map((categoryId) => {
        return (
          <section>
            <div>
              <Tabs id="">
                <TabItem checked value="1">
                  {translate(
                    categoryGroup[categoryId][0].categoryName,
                    props.params.locale,
                  )}
                </TabItem>
              </Tabs>
              <a
                className="govie-link govie-link--no-visited-state"
                href={`/${props.params.locale}/categories/${categoryId}/create-subcategory`}
              >
                New subcategory
              </a>
            </div>
            <table className="govie-table">
              {/* <caption>
                {translate(
                  categoryGroup[categoryId][0].categoryName,
                  props.params.locale,
                )}
              </caption> */}
              <thead className="govie-table__head">
                <tr className="govie-table__row">
                  <th scope="col" className="govie-table__header">
                    {tTable("subcategory")}
                  </th>
                  <th scope="col" className="govie-table__header">
                    {tTable("actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="govie-table__body">
                {categoryGroup[categoryId] ? (
                  categoryGroup[categoryId].map((row) => {
                    if (!row.subcategoryId) {
                      return <Paragraph align="center">No stuff</Paragraph>;
                    }
                    return (
                      <tr key={row.subcategoryId} className="govie-table__row">
                        <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                          {translate(row.subcategoryName, props.params.locale)}
                        </td>
                        <td className="govie-table__cell govie-body-s">
                          <a
                            className="govie-link govie-link--no-visited-state"
                            href={`/${props.params.locale}/subcategories/${row.subcategoryId}`}
                          >
                            {tTable("editAction")}
                          </a>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <>bror</>
                )}
              </tbody>
            </table>
          </section>
        );
      })}
    </>
  );
};
