import React from "react";
import { getTranslations } from "next-intl/server";

export default async function CreatePath(props: {
  params: { locale: string };
}) {
  const tNav = await getTranslations("Navigation");

  return (
    <>
      <div className="govie-breadcrumbs">
        <ol className="govie-breadcrumbs__list">
          <li className="govie-breadcrumbs__list-item">
            <a className="govie-breadcrumbs__link" href="/recommended-paths">
              {tNav("home")}
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
    </>
  );
}
