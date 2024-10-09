import React from "react";
import { Heading, TextInput } from "@govie-ds/react";
import { getTranslations } from "next-intl/server";
import { data, SubcategoryItemModel } from "../../../../../data/data";
import { redirect } from "next/navigation";
import { translate } from "../../../../../utils/locale";

export default async function CreateItem(props: {
  params: { locale: string; subcategoryId: string };
}) {
  const tSubcat = await getTranslations("Subcategory");
  const breadcrumbs = await data.subcategory.breadcrumbs(
    props.params.subcategoryId,
  );

  async function createItemAction(formData: FormData) {
    "use server";

    const titleEn = formData.get("title_en")?.toString();
    const titleGa = formData.get("title_ga")?.toString() || "";
    const textEn = formData.get("text_en")?.toString() || "";
    const textGa = formData.get("text_ga")?.toString() || "";
    const link1NameEn = formData.get("0_link_name_en")?.toString() || "";
    const link1NameGa = formData.get("0_link_name_ga")?.toString() || "";
    const link1href = formData.get("0_link_href")?.toString() || "";
    const link1isExternal = Boolean(formData.get("0_link_isExternal"));
    const link2NameEn = formData.get("1_link_name_en")?.toString() || "";
    const link2NameGa = formData.get("1_link_name_ga")?.toString() || "";
    const link2href = formData.get("1_link_href")?.toString() || "";
    const link2isExternal = Boolean(formData.get("1_link_isExternal"));
    const link3NameEn = formData.get("2_link_name_en")?.toString() || "";
    const link3NameGa = formData.get("2_link_name_ga")?.toString() || "";
    const link3href = formData.get("2_link_href")?.toString() || "";
    const link3isExternal = Boolean(formData.get("2_link_isExternal"));

    if ([titleEn].every((v) => !v)) {
      console.log("handle form error");
      return;
    }

    const links: SubcategoryItemModel["links"] = [
      {
        href: link1href,
        name: { en: link1NameEn, ga: link1NameGa },
        isExternal: link1isExternal,
      },
      {
        href: link2href,
        name: { en: link2NameEn, ga: link2NameGa },
        isExternal: link2isExternal,
      },
      {
        href: link3href,
        name: { en: link3NameEn, ga: link3NameGa },
        isExternal: link3isExternal,
      },
    ];

    const item = {
      title: {
        en: titleEn!,
        ga: titleGa,
      },
      text: {
        en: textEn,
        ga: textGa,
      },
      links,
    };

    try {
      await data.subcategoryItem.create(props.params.subcategoryId, item);
    } catch (err) {
      console.log(err);
      return;
    }
    redirect(
      `/${props.params.locale}/subcategories/${props.params.subcategoryId}`,
    );
  }
  return (
    <>
      <a
        className="govie-back-link"
        href={`/${props.params.locale}/subcategories/${props.params.subcategoryId}`}
      >
        {tSubcat("back")}
      </a>
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
          <li className="govie-breadcrumbs__list-item">
            <span className="govie-breadcrumbs">
              {tSubcat("newItemBreadcrumb")}
            </span>
          </li>
        </ol>
      </div>

      <Heading>{tSubcat("newItem")}</Heading>
      <form action={createItemAction}>
        <fieldset
          style={{
            padding: "12px",
            border: "1px solid gray",
            borderRadius: "2px",
            margin: "0px 0px 50px 0px",
          }}
        >
          <legend style={{ fontSize: "18px", fontWeight: 600 }}>
            {tSubcat("title")}
          </legend>
          <TextInput
            label={{ text: tSubcat("en") }}
            name="title_en"
            required
          ></TextInput>
          <TextInput
            label={{ text: tSubcat("ga") }}
            name="title_ga"
            required
          ></TextInput>
        </fieldset>

        <fieldset
          style={{
            padding: "12px",
            border: "1px solid gray",
            borderRadius: "2px",
            margin: "0px 0px 50px 0px",
          }}
        >
          <legend style={{ fontSize: "18px", fontWeight: 600 }}>
            {tSubcat("text")}
          </legend>

          <TextInput label={{ text: tSubcat("en") }} name="text_en"></TextInput>
          <TextInput label={{ text: tSubcat("ga") }} name="text_ga"></TextInput>
        </fieldset>
        <fieldset
          style={{
            padding: "12px",
            border: "1px solid gray",
            borderRadius: "2px",
            margin: "0px 0px 50px 0px",
          }}
        >
          <legend style={{ fontSize: "18px", fontWeight: 600 }}>
            {tSubcat("link1")}
          </legend>
          <TextInput
            label={{ text: tSubcat("en") }}
            name="0_link_name_en"
          ></TextInput>
          <TextInput
            label={{ text: tSubcat("ga") }}
            name="0_link_name_ga"
          ></TextInput>
          <TextInput
            label={{ text: tSubcat("href") }}
            name="0_link_href"
          ></TextInput>
          <div className="govie-form-group">
            <fieldset className="govie-fieldset">
              <div className="govie-checkboxes govie-checkboxes--small">
                <div className="govie-checkboxes__item">
                  <input
                    className="govie-checkboxes__input"
                    id="0_link_isExternal"
                    name="0_link_isExternal"
                    type="checkbox"
                    value="ext"
                  />
                  <label
                    htmlFor="0_link_isExternal"
                    className="govie-label govie-checkboxes__label"
                  >
                    {tSubcat("isExternal")}
                  </label>
                </div>
              </div>
            </fieldset>
          </div>
        </fieldset>

        <fieldset
          style={{
            padding: "12px",
            border: "1px solid gray",
            borderRadius: "2px",
            margin: "0px 0px 50px 0px",
          }}
        >
          <legend style={{ fontSize: "18px", fontWeight: 600 }}>
            {tSubcat("link2")}
          </legend>
          <TextInput
            label={{ text: tSubcat("en") }}
            name="1_link_name_en"
          ></TextInput>
          <TextInput
            label={{ text: tSubcat("ga") }}
            name="1_link_name_ga"
          ></TextInput>
          <TextInput
            label={{ text: tSubcat("href") }}
            name="1_link_href"
          ></TextInput>
          <div className="govie-form-group">
            <fieldset className="govie-fieldset">
              <div className="govie-checkboxes govie-checkboxes--small">
                <div className="govie-checkboxes__item">
                  <input
                    className="govie-checkboxes__input"
                    id="1_link_isExternal"
                    name="1_link_isExternal"
                    type="checkbox"
                    value="ext"
                  />
                  <label
                    htmlFor="1_link_isExternal"
                    className="govie-label govie-checkboxes__label"
                  >
                    {tSubcat("isExternal")}
                  </label>
                </div>
              </div>
            </fieldset>
          </div>
        </fieldset>

        <fieldset
          style={{
            padding: "12px",
            border: "1px solid gray",
            borderRadius: "2px",
            margin: "0px 0px 50px 0px",
          }}
        >
          <legend style={{ fontSize: "18px", fontWeight: 600 }}>
            {tSubcat("link3")}
          </legend>
          <TextInput
            label={{ text: tSubcat("en") }}
            name="2_link_name_en"
          ></TextInput>
          <TextInput
            label={{ text: tSubcat("ga") }}
            name="2_link_name_ga"
          ></TextInput>
          <TextInput
            label={{ text: tSubcat("href") }}
            name="2_link_href"
          ></TextInput>
          <div className="govie-form-group">
            <fieldset className="govie-fieldset">
              <div className="govie-checkboxes govie-checkboxes--small">
                <div className="govie-checkboxes__item">
                  <input
                    className="govie-checkboxes__input"
                    id="2_link_isExternal"
                    name="2_link_isExternal"
                    type="checkbox"
                    value="ext"
                  />
                  <label
                    htmlFor="2_link_isExternal"
                    className="govie-label govie-checkboxes__label"
                  >
                    {tSubcat("isExternal")}
                  </label>
                </div>
              </div>
            </fieldset>
          </div>
        </fieldset>
        <button className="govie-button govie-button" type="submit">
          {tSubcat("addNewItem")}
        </button>
      </form>
    </>
  );
}
