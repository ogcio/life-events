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
  params: { locale: string; itemId: string };
  searchParams: { did: string };
}) => {
  const tSubcat = await getTranslations("Subcategory");
  let formData: Awaited<ReturnType<typeof data.subcategoryItem.formData>>;
  try {
    formData = await data.subcategoryItem.formData(props.params.itemId);
  } catch (err) {
    console.log(err);
    return <>Not found</>;
  }

  const breadcrumbs = await data.subcategoryItem.breadcrumbs(
    props.params.itemId,
  );

  async function subcategoryFormAction(formData: FormData) {
    "use server";

    const textEn = formData.get("text_en")?.toString() || "";
    const textGa = formData.get("text_ga")?.toString() || "";
    const titleEn = formData.get("title_en")?.toString() || "";
    const titleGa = formData.get("title_ga")?.toString() || "";

    await data.subcategory.update({
      id: props.params.itemId,
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

  return (
    <>
      <div className="govie-breadcrumbs">
        <ol className="govie-breadcrumbs__list">
          {breadcrumbs?.map((bc, i) => (
            <li key={`bc_i`} className="govie-breadcrumbs__list-item">
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
        href={`/${props.params.locale}/subcategories/${formData.subcategoryId}`}
      >
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

        {formData.links.map((link, i) => (
          <fieldset
            key={`${formData.id}_link_${i}}`}
            style={{
              padding: "10px",
              border: "1px solid gray",
              borderRadius: "2px",
              margin: "0px 0px 50px 0px",
            }}
          >
            <legend style={{ fontSize: "18px", fontWeight: 600 }}>
              {tSubcat(i === 0 ? "link1" : i === 1 ? "link2" : "link3")}
            </legend>
            {Object.keys(link.name).map((langKey) => (
              <TextInput
                key={`link_${langKey}`}
                defaultValue={translate(link.name, langKey)}
                label={{ text: tSubcat(langKey) }}
                name={`${i}_link_name_${langKey}`}
              ></TextInput>
            ))}
            <TextInput
              defaultValue={link.href}
              label={{ text: tSubcat("href") }}
              name={`${i}_link_href`}
            ></TextInput>
            <div className="govie-form-group">
              <fieldset className="govie-fieldset">
                <div className="govie-checkboxes govie-checkboxes--small">
                  <div className="govie-checkboxes__item">
                    <input
                      className="govie-checkboxes__input"
                      id={`${i}_${formData.id}`}
                      name={`${i}_link_isExternal`}
                      type="checkbox"
                      defaultChecked={link.isExternal}
                      value="ext"
                    />
                    <label
                      htmlFor={`${i}_${formData.id}`}
                      className="govie-label govie-checkboxes__label"
                    >
                      {tSubcat("isExternal")}
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>

            <button
              style={{ margin: "unset" }}
              className="govie-button govie-button--medium"
              type="submit"
            >
              {tSubcat("save")}
            </button>
          </fieldset>
        ))}
      </form>
    </>
  );
};
