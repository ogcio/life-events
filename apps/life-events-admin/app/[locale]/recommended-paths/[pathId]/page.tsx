import React from "react";
import { getTranslations } from "next-intl/server";
import { Heading } from "@govie-ds/react";
import { data } from "../../../../data/data";
import JourneySelections from "../JourneySelectionsClient";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function CreatePath(props: {
  params: { locale: string; pathId: string };
}) {
  const tNav = await getTranslations("Navigation");

  let pathData:
    | Awaited<ReturnType<typeof data.recommendedPaths.one>>
    | undefined;
  try {
    pathData = await data.recommendedPaths.one(props.params.pathId);
  } catch (err) {
    console.log(":(");
  }

  let fromOptions:
    | Awaited<ReturnType<typeof data.recommendedPaths.options>>
    | undefined;
  let toOptions:
    | Awaited<ReturnType<typeof data.recommendedPaths.options>>
    | undefined;

  const search = new URLSearchParams(headers().get("x-search") || "");

  const fromCategoryId = search.get("fcid") || pathData?.fromCategoryId;
  const fromSubcategoryId = search.get("fsid") || pathData?.fromSubcategoryId;
  const fromSubcategoryItemId =
    search.get("fiid") || pathData?.fromSubcategoryItemId;

  const toCategoryId = search.get("tcid") || pathData?.toCategoryId;
  const toSubcategoryId = search.get("tsid") || pathData?.toSubcategoryId;
  const toSubcategoryItemId =
    search.get("tiid") || pathData?.toSubcategoryItemId;

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

    const pathId = formData.get("pathId")?.toString() || "";

    const toSubcategoryItemId =
      formData.get("toSubcategoryItemId")?.toString() || "";
    const fromSubcategoryItemId =
      formData.get("fromSubcategoryItemId")?.toString() || "";

    await data.recommendedPaths.update(
      pathId,
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
              {tNav("updatePathBreadcrumb")}
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

      <Heading>Update a journey link</Heading>
      <JourneySelections
        pathId={props.params.pathId}
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
