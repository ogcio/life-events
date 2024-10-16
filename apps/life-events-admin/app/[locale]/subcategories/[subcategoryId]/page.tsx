import React from "react";
import { Heading, TextInput, Paragraph } from "@govie-ds/react";
import { data } from "../../../../data/data";
import { translate } from "../../../../utils/locale";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import TableSection from "../../../TableSection";
import TableHeading from "../../../TableHeading";
import TableHeader from "../../../TableHeader";
import TableNewButtonLink from "../../../TableNewButtonLink";

export default async (props: {
  params: { locale: string; subcategoryId: string };
  searchParams: { did: string };
}) => {
  const [tSubcat, tTable, tForm] = await Promise.all([
    getTranslations("Subcategory"),
    getTranslations("Table"),
    getTranslations("Form"),
  ]);
  let formData: Awaited<ReturnType<typeof data.subcategory.formData>>;
  try {
    formData = await data.subcategory.formData(props.params.subcategoryId);
  } catch (err) {
    console.log(err);
    return <>Not found</>;
  }

  const breadcrumbs = await data.subcategory.breadcrumbs(
    props.params.subcategoryId,
  );

  async function subcategoryFormAction(formData: FormData) {
    "use server";

    const textEn = formData.get("text_en")?.toString() || "";
    const textGa = formData.get("text_ga")?.toString() || "";
    const titleEn = formData.get("title_en")?.toString() || "";
    const titleGa = formData.get("title_ga")?.toString() || "";

    await data.subcategory.update({
      id: props.params.subcategoryId,
      text: {
        en: textEn,
        ga: textGa,
      },
      title: {
        en: titleEn,
        ga: titleGa,
      },
    });
    revalidatePath("/");
  }

  async function deleteItemAction(formData: FormData) {
    "use server";

    const itemId = formData.get("id")?.toString();
    if (!itemId) {
      return;
    }

    await data.subcategoryItem.delete(itemId);

    redirect(
      `/${props.params.locale}/subcategories/${props.params.subcategoryId}`,
    );
  }

  const itemToBeDeleted = formData.items.find(
    (item) => item.id === props.searchParams.did,
  );

  return (
    <>
      {itemToBeDeleted && (
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
              <a
                href={`/${props.params.locale}/subcategories/${props.params.subcategoryId}`}
              >
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
                <span className="govie-visually-hidden">
                  {tSubcat("close")}
                </span>
              </a>
              <span className="govie-tooltip govie-tooltip--undefined">
                {tSubcat("close")}
              </span>
            </div>
            <h1 className="govie-heading-s">
              {tSubcat("confirmDeletionTitle")}
            </h1>
            <p className="govie-body">
              {tSubcat("modalDeleteP1")}&nbsp;
              <b>{translate(itemToBeDeleted.title, props.params.locale)}</b>
            </p>
            <p className="govie-body">{tSubcat("modalDeleteP2")}</p>
            <div className="govie-modal--buttons">
              <a
                style={{ width: "fit-content" }}
                href={`/${props.params.locale}/subcategories/${props.params.subcategoryId}`}
                className="govie-button govie-button--medium govie-button--outlined"
              >
                {tSubcat("modalCancel")}
              </a>
              <form action={deleteItemAction} style={{ minWidth: "45%" }}>
                <input
                  name="id"
                  defaultValue={itemToBeDeleted.id}
                  type="hidden"
                ></input>
                <button
                  className="govie-button govie-button--medium "
                  style={{ width: "100%" }}
                >
                  {tSubcat("deleteConfirm")}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="govie-breadcrumbs">
        <ol className="govie-breadcrumbs__list">
          {breadcrumbs?.map((bc, i) => (
            <li key={`bc_${i}`} className="govie-breadcrumbs__list-item">
              {translate(bc, props.params.locale, "href") ? (
                <a
                  className="govie-breadcrumbs__link"
                  href={translate(bc, props.params.locale, "href")}
                >
                  {translate(bc, props.params.locale, "label")}
                </a>
              ) : (
                <span className="govie-breadcrumbs">
                  {translate(bc, props.params.locale, "label")}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>

      <a className="govie-back-link" href={"/categories"}>
        {tSubcat("back")}
      </a>

      <Heading>{translate(formData.title, props.params.locale)}</Heading>
      <form action={subcategoryFormAction}>
        <fieldset
          style={{
            padding: "12px",
            border: "1px solid gray",
            borderRadius: "2px",
            marginBottom: "50px",
          }}
        >
          <legend style={{ fontSize: "18px", fontWeight: 600 }}>
            {tForm("title")}
          </legend>

          {Object.keys(formData.title).map((langKey) => (
            <TextInput
              key={`title_${langKey}`}
              defaultValue={translate(formData.title, langKey)}
              label={{ text: tForm(langKey) }}
              name={`title_${langKey}`}
            ></TextInput>
          ))}
          <button
            style={{ margin: "unset" }}
            className="govie-button govie-button--medium"
            type="submit"
          >
            {tForm("save")}
          </button>
        </fieldset>

        <fieldset
          style={{
            padding: "12px",
            border: "1px solid gray",
            borderRadius: "2px",
            marginBottom: "50px",
          }}
        >
          <legend style={{ fontSize: "18px", fontWeight: 600 }}>
            {tForm("text")}
          </legend>

          {Object.keys(formData.title).map((langKey) => (
            <TextInput
              key={`desc_${langKey}`}
              defaultValue={translate(formData.text, langKey)}
              label={{ text: tForm(langKey) }}
              name={`text_${langKey}`}
            ></TextInput>
          ))}

          <button
            style={{ margin: "unset" }}
            className="govie-button govie-button--medium"
            type="submit"
          >
            {tForm("save")}
          </button>
        </fieldset>
      </form>

      <TableSection>
        <TableHeading>
          <TableHeader>
            {translate(formData.title, props.params.locale)}
          </TableHeader>
          <TableNewButtonLink
            href={`/${props.params.locale}/subcategories/${props.params.subcategoryId}/create-item`}
          >
            {tSubcat("addNewItem")}
          </TableNewButtonLink>
        </TableHeading>
        <div style={{ padding: "24px" }}>
          {!Boolean(formData.items?.length) && (
            <Paragraph align="center" style={{ margin: "0 auto" }}>
              {tTable("noRows")}
            </Paragraph>
          )}
          {Boolean(formData.items.length) && (
            <table className="govie-table">
              <thead className="govie-table__head">
                <tr className="govie-table__row">
                  <th scope="col" className="govie-table__header">
                    {tTable("journeyItem")}
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
                {formData.items.map((row) => (
                  <tr key={row.id} className="govie-table__row">
                    <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-m">
                      {translate(row.title, props.params.locale)}
                    </td>
                    <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s govie-table__cell--numeric">
                      <div>
                        <div>
                          <a
                            className="govie-link govie-link--no-visited-state govie-!-margin-right-3"
                            href={`/${props.params.locale}/subcategory-items/${row.id}`}
                          >
                            {tTable("editAction")}
                          </a>
                          <a
                            className="govie-link govie-link--no-visited-state govie-!-margin-right-0"
                            href={`?did=${row.id}`}
                          >
                            {tTable("deleteAction")}
                          </a>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </TableSection>
    </>
  );
};
