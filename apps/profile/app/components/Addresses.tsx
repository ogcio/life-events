import { getTranslations } from "next-intl/server";
import { routes } from "../utils";
import Link from "next/link";

export default async () => {
  const t = await getTranslations("Addresses");

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 className="govie-heading-m">{t("addresses")}</h2>
        <Link
          data-module="govie-button"
          className="govie-button govie-button--secondary"
          style={{ marginBottom: 0 }}
          href={routes.addresses.newAddress.path()}
        >
          {t("addAddress")}
        </Link>
      </div>
      <p className="govie-body">{t("noAddresses")}</p>
    </>
  );
};
