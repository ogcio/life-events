import { getTranslations } from "next-intl/server";
import React from "react";
import TableSection from "../../TableSection";
import TableHeading from "../../TableHeading";
import TableHeader from "../../TableHeader";
import TableNewButtonLink from "../../TableNewButtonLink";
import { data } from "../../../data/data";
import { translate } from "../../../utils/locale";
import { Paragraph } from "@govie-ds/react";
import { redirect } from "next/navigation";

export default async function RecommendedPaths(props: {
  params: { locale: string };
  searchParams?: { did?: string };
}) {
  const [tTable, tModal, tPaths] = await Promise.all([
    getTranslations("Table"),
    getTranslations("Modal"),
    getTranslations("Paths"),
  ]);

  const tableRows = await data.recommendedPaths.table();

  async function deleteItemAction(formData: FormData) {
    "use server";

    const pathId = formData.get("id")?.toString();
    if (!pathId) {
      return;
    }

    await data.recommendedPaths.delete(pathId);

    redirect(`/recommended-paths`);
  }

  const idToBeDeleted = props.searchParams?.did;
  return (
    <>
      {idToBeDeleted && (
        <div className="govie-modal">
          <div className="govie-modal--overlay"></div>
          <div
            className="govie-modal--content"
            style={{ position: "fixed", top: "20%" }}
          >
            <div
              className="govie-modal--close-button-container"
              style={{ padding: "15px" }}
            >
              <a href={`/recommended-paths`}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"
                    fill="#505A5F"
                  ></path>
                </svg>
                <span className="govie-visually-hidden">{tModal("close")}</span>
              </a>
              <span className="govie-tooltip govie-tooltip--undefined">
                {tModal("close")}
              </span>
            </div>
            <h1 className="govie-heading-s">
              {tModal("confirmDeletionTitleGeneric")}
            </h1>
            <p className="govie-body">{tModal("deleteP1Generic")}</p>
            <p className="govie-body">{tModal("deleteP2Generic")}</p>
            <div className="govie-modal--buttons">
              <a
                style={{ width: "fit-content" }}
                href={`/recommended-paths`}
                className="govie-button govie-button--medium govie-button--outlined"
              >
                {tModal("confirmCancel")}
              </a>
              <form action={deleteItemAction} style={{ minWidth: "45%" }}>
                <input
                  name="id"
                  defaultValue={idToBeDeleted}
                  type="hidden"
                ></input>
                <button
                  className="govie-button govie-button--medium "
                  style={{ width: "100%" }}
                >
                  {tModal("confirmDelete")}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      <h1>{tPaths("pathsHeader")}</h1>

      <TableSection>
        <TableHeading>
          <TableHeader>{tPaths("itemJourneysHeader")}</TableHeader>
          <TableNewButtonLink
            href={`/${props.params.locale}/recommended-paths/create-path`}
          >
            {tPaths("newPathLabel")}
          </TableNewButtonLink>
        </TableHeading>
        <div style={{ padding: "24px" }}>
          {Boolean(tableRows.length) ? (
            <table className="govie-table">
              <thead className="govie-table__head">
                <tr className="govie-table__row">
                  <th scope="col" className="govie-table__header">
                    {tTable("from")}
                  </th>
                  <th scope="col" className="govie-table__header">
                    {tTable("to")}
                  </th>
                  <th
                    scope="col"
                    className="govie-table__header govie-table__header--numeric"
                  >
                    {tTable("actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="govie-table__body">
                {tableRows.map((row) => (
                  <tr className="govie-table__row">
                    <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                      {translate(row.fromCategoryTitle, props.params.locale)}
                      <br />
                      {translate(row.fromSubcategoryTitle, props.params.locale)}
                      <br />
                      {translate(
                        row.fromSubcategoryItemTitle,
                        props.params.locale,
                      )}
                    </td>
                    <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                      {translate(row.toCategoryTitle, props.params.locale)}
                      <br />
                      {translate(row.toSubcategoryTitle, props.params.locale)}
                      <br />
                      {translate(
                        row.toSubcategoryItemTitle,
                        props.params.locale,
                      )}
                    </td>
                    <td className="govie-table__cell govie-body-s govie-table__cell--numeric">
                      <a
                        className="govie-link govie-link--no-visited-state govie-!-margin-right-3"
                        href={`/recommended-paths/${row.id}`}
                      >
                        {tTable("editAction")}
                      </a>
                      <a
                        className="govie-link govie-link--no-visited-state"
                        href={`?did=${row.id}`}
                      >
                        {tTable("deleteAction")}
                      </a>
                    </td>
                  </tr>
                ))}
                <tr className="govie-table__row"></tr>
              </tbody>
            </table>
          ) : (
            <Paragraph align="center" style={{ margin: "0 auto" }}>
              {tTable("noRows")}
            </Paragraph>
          )}
        </div>
      </TableSection>
    </>
  );
}
