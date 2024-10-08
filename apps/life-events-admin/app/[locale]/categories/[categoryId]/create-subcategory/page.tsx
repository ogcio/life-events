import React from "react";
import { Heading, TextInput } from "@govie-ds/react";
import { getTranslations } from "next-intl/server";
import { data, SubcategoryItemModel } from "../../../../../data/data";
import { redirect } from "next/navigation";
import { translate } from "../../../../../utils/locale";

export default async function CreateItem(props: {
  params: { locale: string; categoryId: string };
}) {
  const tSubcat = await getTranslations("Subcategory");

  const breadcrumbs = await data.category.breadcrumbs(props.params.categoryId);

  async function createItemAction(formData: FormData) {
    "use server";

    const titleEn = formData.get("title_en")?.toString();
    const titleGa = formData.get("title_ga")?.toString() || "";
    const textEn = formData.get("text_en")?.toString() || "";
    const textGa = formData.get("text_ga")?.toString() || "";

    if ([titleEn].every((v) => !v)) {
      console.log("handle form error");
      return;
    }

    const item = {
      title: {
        en: titleEn!,
        ga: titleGa,
      },
      text: {
        en: textEn,
        ga: textGa,
      },
    };

    let categoryId: string | undefined;
    try {
      categoryId = await data.subcategory.create(props.params.categoryId, item);
    } catch (err) {
      console.log(err);
      return;
    }
    redirect(`/${props.params.locale}/subcategories/${categoryId}`);
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

      <a className="govie-back-link" href={`/${props.params.locale}`}>
        {tSubcat("back")}
      </a>
      <Heading>{tSubcat("newSubcatHeading")}</Heading>
      <form action={createItemAction}>
        <fieldset
          style={{
            padding: "10px",
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
            padding: "10px",
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

        <button className="govie-button govie-button" type="submit">
          {tSubcat("create")}
        </button>
      </form>
    </>
  );
}
