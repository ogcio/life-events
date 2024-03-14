import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async () => {
  const t = await getTranslations("FeatureFlags");

  return (
    <ol className="govie-list govie-list--spaced" style={{ width: "200px" }}>
      <li tabIndex={0}>
        <Link
          className="govie-button govie-button--icon govie-button--flat govie-button--icon govie-!-font-size-16"
          href={"/featureFlags"}
          style={{
            margin: "unset",
            paddingLeft: "12px",
            width: "100%",
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          {t("menu.featureFlags")}
        </Link>
      </li>
    </ol>
  );
};
