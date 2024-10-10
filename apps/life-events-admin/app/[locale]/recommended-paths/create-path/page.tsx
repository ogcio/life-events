import React from "react";
import { getTranslations } from "next-intl/server";
import { Heading } from "@govie-ds/react";
import { data } from "../../../../data/data";
import SelectionForm from "../JourneySelectionsClient";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function CreatePath(props: {
  params: { locale: string };
}) {
  const tNav = await getTranslations("Navigation");

  let fromOptions:
    | Awaited<ReturnType<typeof data.recommendedPaths.options>>
    | undefined;
  let toOptions:
    | Awaited<ReturnType<typeof data.recommendedPaths.options>>
    | undefined;

  const search = new URLSearchParams(headers().get("x-search") || "");

  const fromCategoryId = search.get("fcid") || undefined;
  const fromSubcategoryId = search.get("fsid") || undefined;
  const fromSubcategoryItemId = search.get("fiid") || undefined;

  const toCategoryId = search.get("tcid") || undefined;
  const toSubcategoryId = search.get("tsid") || undefined;
  const toSubcategoryItemId = search.get("tiid") || undefined;

  try {
    [fromOptions, toOptions] = await Promise.all([
      data.recommendedPaths.options(
        props.params.locale,
        fromCategoryId,
        fromSubcategoryId,
      ),
      data.recommendedPaths.options(
        props.params.locale,
        toCategoryId,
        toSubcategoryId,
      ),
    ]);
  } catch (err) {
    console.log(":(");
  }

  async function journeyPathSelectionAction(formData: FormData) {
    "use server";

    const toSubcategoryItemId =
      formData.get("toSubcategoryItemId")?.toString() || "";
    const fromSubcategoryItemId =
      formData.get("fromSubcategoryItemId")?.toString() || "";

    await data.recommendedPaths.create(
      toSubcategoryItemId,
      fromSubcategoryItemId,
    );

    redirect("/recommended-paths");
  }

  return (
    <>
      <div className="govie-breadcrumbs">
        <ol className="govie-breadcrumbs__list">
          <li className="govie-breadcrumbs__list-item">
            <a className="govie-breadcrumbs__link" href="/recommended-paths">
              {tNav("recommendedPathsBreadcrumb")}
            </a>
          </li>
          <li className="govie-breadcrumbs__list-item">
            <span className="govie-breadcrumbs">
              {tNav("createPathBreadcrumb")}
            </span>
          </li>
        </ol>
      </div>

      <a
        className="govie-back-link"
        href={`/${props.params.locale}/recommended-paths`}
      >
        {tNav("back")}
      </a>

      <Heading>Create new journey link</Heading>
      <SelectionForm
        formAction={journeyPathSelectionAction}
        lang={props.params.locale}
        from={{
          category: {
            options:
              fromOptions?.categories.map((c) => ({
                label: c.title,
                value: c.id,
              })) ?? [],
            selectedValue: fromCategoryId,
          },
          subcategory: {
            options:
              fromOptions?.subcategories.map((c) => ({
                label: c.title,
                value: c.id,
              })) ?? [],
            selectedValue: fromSubcategoryId,
          },
          subcategoryItem: {
            options:
              fromOptions?.subcategoryItems.map((c) => ({
                label: c.title,
                value: c.id,
              })) ?? [],
            selectedValue: fromSubcategoryItemId,
          },
        }}
        to={{
          category: {
            options:
              toOptions?.categories.map((c) => ({
                label: c.title,
                value: c.id,
              })) ?? [],
            selectedValue: toCategoryId,
          },
          subcategory: {
            options:
              toOptions?.subcategories.map((c) => ({
                label: c.title,
                value: c.id,
              })) ?? [],
            selectedValue: toSubcategoryId,
          },
          subcategoryItem: {
            options:
              toOptions?.subcategoryItems.map((c) => ({
                label: c.title,
                value: c.id,
              })) ?? [],
            selectedValue: toSubcategoryItemId,
          },
        }}
      />
    </>
  );
}
