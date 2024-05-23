import { getTranslations } from "next-intl/server";
import TemplatesList from "./TemplatesList";
import FlexMenuWrapper from "../PageWithMenuFlexWrapper";
import Link from "next/link";

export default async () => {
  const t = await getTranslations("MessageTemplates");

  const url = new URL("admin/templates/template", process.env.HOST_URL);
  url.searchParams.append("lang", "en");

  return (
    <main className="govie-main-wrapper " id="main-content" role="main">
      <FlexMenuWrapper>
        <h1 className="govie-heading-l">{t("title")}</h1>

        <Link href={url.href} className="govie-link">
          Create
        </Link>

        <TemplatesList />
      </FlexMenuWrapper>
    </main>
  );
};
