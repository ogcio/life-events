import React from "react";
import {
  Heading,
  TextInput,
  Label,
  LabelSize,
  Paragraph,
} from "@govie-ds/react";
import { data } from "../../../../data/data";
import { translate } from "../../../../utils/locale";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async (props: {
  params: { locale: string; subcategoryId: string };
  searchParams: { did: string };
}) => {
  const [tSubcat, tTable] = await Promise.all([
    getTranslations("Subcategory"),
    getTranslations("Table"),
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

  async function itemFormAction(formData: FormData) {
    "use server";

    const itemId = formData.get("id")?.toString() || "";
    if (!itemId) {
      return;
    }

    const titleEn = formData.get("title_en")?.toString() || "";
    const titleGa = formData.get("title_ga")?.toString() || "";
    const textEn = formData.get("text_en")?.toString() || "";
    const textGa = formData.get("text_ga")?.toString() || "";
    const link1nameEn = formData.get("0_link_name_en")?.toString() || "";
    const link1nameGa = formData.get("0_link_name_ga")?.toString() || "";
    const link1href = formData.get("0_link_href")?.toString() || "";
    const link1external = Boolean(formData.get("0_link_isExternal"));

    const link2nameEn = formData.get("1_link_name_en")?.toString() || "";
    const link2nameGa = formData.get("1_link_name_ga")?.toString() || "";
    const link2href = formData.get("1_link_href")?.toString() || "";
    const link2external = Boolean(formData.get("1_link_isExternal"));

    const link3nameEn = formData.get("2_link_name_en")?.toString() || "";
    const link3nameGa = formData.get("2_link_name_ga")?.toString() || "";
    const link3href = formData.get("2_link_href")?.toString() || "";
    const link3external = Boolean(formData.get("2_link_isExternal"));

    await data.subcategoryItem.update({
      id: itemId,
      links: [
        {
          href: link1href,
          isExternal: link1external,
          name: {
            en: link1nameEn,
            ga: link1nameGa,
          },
        },
        {
          href: link2href,
          isExternal: link2external,
          name: {
            en: link2nameEn,
            ga: link2nameGa,
          },
        },
        {
          href: link3href,
          isExternal: link3external,
          name: {
            en: link3nameEn,
            ga: link3nameGa,
          },
        },
      ],
      text: {
        en: textEn,
        ga: textGa,
      },
      title: {
        en: titleEn,
        ga: titleGa,
      },
    });
  }

  async function newItemAction() {
    "use server";

    redirect(
      `/${props.params.locale}/subcategories/${props.params.subcategoryId}/create-item`,
    );
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
              style={{ padding: "10px" }}
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
                <button className="govie-button govie-button--medium ">
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

      <a className="govie-back-link" href="/">
        {tSubcat("back")}
      </a>

      <Heading>{translate(formData.title, props.params.locale)}</Heading>
      <form action={subcategoryFormAction}>
        <fieldset
          style={{
            padding: "10px",
            border: "1px solid gray",
            borderRadius: "2px",
            marginBottom: "50px",
          }}
        >
          <legend style={{ fontSize: "18px", fontWeight: 600 }}>
            {tSubcat("title")}
          </legend>

          {Object.keys(formData.title).map((langKey) => (
            <TextInput
              key={`title_${langKey}`}
              defaultValue={translate(formData.title, langKey)}
              label={{ text: tSubcat(langKey) }}
              name={`title_${langKey}`}
            ></TextInput>
          ))}
          <button
            style={{ margin: "unset" }}
            className="govie-button govie-button--medium"
            type="submit"
          >
            {tSubcat("save")}
          </button>
        </fieldset>

        <fieldset
          style={{
            padding: "10px",
            border: "1px solid gray",
            borderRadius: "2px",
            marginBottom: "50px",
          }}
        >
          <legend style={{ fontSize: "18px", fontWeight: 600 }}>
            {tSubcat("text")}
          </legend>
          {!formData.text.en && (
            <Label
              text={tSubcat("emptyDisclaimer")}
              size={LabelSize.sm}
            ></Label>
          )}

          {Object.keys(formData.title).map((langKey) => (
            <TextInput
              key={`desc_${langKey}`}
              defaultValue={translate(formData.text, langKey)}
              label={{ text: tSubcat(langKey) }}
              name={`text_${langKey}`}
            ></TextInput>
          ))}

          <button
            style={{ margin: "unset" }}
            className="govie-button govie-button--medium"
            type="submit"
          >
            {tSubcat("save")}
          </button>
        </fieldset>
      </form>

      <a
        className="govie-link govie-link--no-visited-state"
        href={`/${props.params.locale}/subcategories/${props.params.subcategoryId}/create-item`}
      >
        {tSubcat("addNewItem")}
      </a>
      <table className="govie-table">
        <caption>{translate(formData.title, props.params.locale)}</caption>
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
          {formData.items?.length ? (
            formData.items.map((row) => (
              <tr key={row.id} className="govie-table__row">
                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  {translate(row.title, props.params.locale)}
                </td>
                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  <div>
                    <div>
                      <a
                        className="govie-link govie-link--no-visited-state govie-!-margin-right-3"
                        href={`/${props.params.locale}/subcategory-items/${row.id}`}
                      >
                        {tTable("editAction")}
                      </a>
                      <a
                        className="govie-link govie-link--no-visited-state govie-!-margin-right-3"
                        href={`/${props.params.locale}/subcategor/${row.id}`}
                      >
                        {tTable("deleteAction")}
                      </a>
                    </div>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <Paragraph align="center">{tTable("empty")}</Paragraph>
          )}
        </tbody>
      </table>
    </>
  );
};
