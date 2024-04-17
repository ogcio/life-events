import { NextPageProps } from "../../../../types";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { PgSessions } from "auth/sessions";
import { SearchForm } from "./SearchForm";
import { ManualAddressForm } from "./ManualAddressForm";
import { SelectForm } from "./SelectForm";

export type FormProps = {
  userData: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  addressQuery: string;
};

const searchParamKeys = { address: "adr", formType: "t" };

export default async (params: NextPageProps) => {
  const { searchParams } = params;

  const t = await getTranslations("AddressForm");
  const { userId, firstName, lastName, email } = await PgSessions.get();
  const userData = { userId, firstName, lastName, email };

  const searchUrl = new URLSearchParams(searchParams);
  const isManualForm = searchUrl.get(searchParamKeys.formType) === "manual";
  const isSelectForm = searchUrl?.get(searchParamKeys.address);

  let Form = isManualForm
    ? ManualAddressForm
    : isSelectForm
      ? SelectForm
      : SearchForm;

  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds">
        <h1 className="govie-heading-l">{t("newAddress")}</h1>
        <Form
          addressQuery={searchUrl?.get(searchParamKeys.address) ?? ""}
          userData={userData}
        />
        <div style={{ margin: "30px 0" }}>
          <Link href={"/"} className="govie-back-link">
            {t("back")}
          </Link>
        </div>
      </div>
    </div>
  );
};
