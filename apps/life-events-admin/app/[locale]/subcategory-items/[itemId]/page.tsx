import React from "react";
import { Heading, TextInput, Label, LabelSize } from "@govie-ds/react";
import { data } from "../../../../data/data";
import { translate } from "../../../../utils/locale";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async (props: {
  params: { locale: string; itemId: string };
  searchParams: { did: string };
}) => {
  const [tSubcat, tForm] = await Promise.all([
    getTranslations("Subcategory"),
    getTranslations("Form"),
  ]);
  let itemData: Awaited<ReturnType<typeof data.subcategoryItem.formData>>;
  try {
    itemData = await data.subcategoryItem.formData(props.params.itemId);
  } catch (err) {
    console.log(err);
    return <>Not found</>;
  }

  const breadcrumbs = await data.subcategoryItem.breadcrumbs(
    props.params.itemId,
  );

  async function itemFormAction(formData: FormData) {
    "use server";

    const titleEn = formData.get("title_en")?.toString() || "";
    const titleGa = formData.get("title_ga")?.toString() || "";
    const textEn = formData.get("text_en")?.toString() || "";
    const textGa = formData.get("text_ga")?.toString() || "";
    const isHighlighted = Boolean(formData.get("isHighlighted"));

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
      id: props.params.itemId,
      isHighlighted,
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

    redirect(`/${props.params.locale}/subcategories/${itemData.subcategoryId}`);
  }

  return (
    <>
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

      <a
        className="govie-back-link"
        href={`/${props.params.locale}/subcategories/${itemData.subcategoryId}`}
      >
        {tSubcat("back")}
      </a>

      <Heading>{translate(itemData.title, props.params.locale)}</Heading>
      <form action={itemFormAction}>
        <div className="govie-form-group">
          <fieldset className="govie-fieldset">
            <div className="govie-checkboxes govie-checkboxes--medium">
              <div className="govie-checkboxes__item">
                <input
                  className="govie-checkboxes__input"
                  id={"asd"}
                  name="isHighlighted"
                  type="checkbox"
                  defaultChecked={itemData.isHighlighted}
                  value="isHighlighted"
                />
                <label
                  htmlFor={"asd"}
                  className="govie-label govie-checkboxes__label"
                >
                  {tForm("isHighlighted")}
                </label>
              </div>
            </div>
          </fieldset>
        </div>

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

          {Object.keys(itemData.title).map((langKey) => (
            <TextInput
              key={`title_${langKey}`}
              defaultValue={translate(itemData.title, langKey)}
              label={{ text: tForm(langKey) }}
              name={`title_${langKey}`}
            ></TextInput>
          ))}
          {/* <button
            style={{ margin: "unset" }}
            className="govie-button govie-button--medium"
            type="submit"
          >
            {tForm("save")}
          </button> */}
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

          {Object.keys(itemData.title).map((langKey) => (
            <TextInput
              key={`desc_${langKey}`}
              defaultValue={translate(itemData.text, langKey)}
              label={{ text: tForm(langKey) }}
              name={`text_${langKey}`}
            ></TextInput>
          ))}

          {/* <button
            style={{ margin: "unset" }}
            className="govie-button govie-button--medium"
            type="submit"
          >
            {tForm("save")}
          </button> */}
        </fieldset>

        {itemData.links.map((link, i) => (
          <fieldset
            key={`${itemData.id}_link_${i}}`}
            style={{
              padding: "12px",
              border: "1px solid gray",
              borderRadius: "2px",
              margin: "0px 0px 50px 0px",
            }}
          >
            <legend style={{ fontSize: "18px", fontWeight: 600 }}>
              {tForm(i === 0 ? "link1" : i === 1 ? "link2" : "link3")}
            </legend>
            {Object.keys(link.name).map((langKey) => (
              <TextInput
                key={`link_${langKey}`}
                defaultValue={translate(link.name, langKey)}
                label={{ text: tForm(langKey) }}
                name={`${i}_link_name_${langKey}`}
              ></TextInput>
            ))}
            <TextInput
              defaultValue={link.href}
              label={{ text: tForm("href") }}
              name={`${i}_link_href`}
            ></TextInput>
            <div className="govie-form-group">
              <fieldset className="govie-fieldset">
                <div className="govie-checkboxes govie-checkboxes--small">
                  <div className="govie-checkboxes__item">
                    <input
                      className="govie-checkboxes__input"
                      id={`${i}_${itemData.id}`}
                      name={`${i}_link_isExternal`}
                      type="checkbox"
                      defaultChecked={link.isExternal}
                      value="ext"
                    />
                    <label
                      htmlFor={`${i}_${itemData.id}`}
                      className="govie-label govie-checkboxes__label"
                    >
                      {tForm("isExternal")}
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>

            {/* <button
              style={{ margin: "unset" }}
              className="govie-button govie-button--medium"
              type="submit"
            >
              {tForm("save")}
            </button> */}
          </fieldset>
        ))}

        <button type="submit" className="govie-button">
          {tForm("update")}
        </button>
      </form>
    </>
  );
};
