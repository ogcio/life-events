import { getTranslations } from "next-intl/server";
import { PgSessions } from "auth/sessions";
import Link from "next/link";
import { form, routes } from "../../../utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NextPageProps } from "../../../../types";

export default async (props: NextPageProps) => {
  const t = await getTranslations("AddressForm");
  const { userId } = await PgSessions.get();
  const errorT = await getTranslations("FormErrors");
  const { locale } = props.params;
  const errors = await form.getErrorsQuery(
    userId,
    routes.addresses.searchAddress.slug,
  );

  async function searchAction(formData: FormData) {
    "use server";

    const searchQuery = formData.get("newAddress");

    if (!searchQuery?.toString().length) {
      await form.insertErrors(
        [
          {
            messageKey: form.errorTranslationKeys.empty,
            errorValue: "",
            field: form.fieldTranslationKeys.address,
          },
        ],
        userId,
        routes.addresses.searchAddress.slug,
      );
      return revalidatePath("/");
    }

    if (searchQuery) {
      redirect(
        `/${locale}/${routes.addresses.selectAddress.path()}${"?adr="}${searchQuery}`,
      );
    }
  }

  const addressError = errors.rows.at(0);

  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds">
        <h1 className="govie-heading-l">{t("newAddress")}</h1>
        <form action={searchAction}>
          <h2 className="govie-heading-m">{t("addressSearchTitle")}</h2>
          <div
            className={`govie-form-group ${
              addressError ? "govie-form-group--error" : ""
            }`.trim()}
          >
            <div className="govie-hint" id="input-field-hint">
              {t("searchHint")}
            </div>
            {addressError && (
              <p id="input-field-error" className="govie-error-message">
                <span className="govie-visually-hidden">{t("error")}</span>
                {errorT(addressError.messageKey, {
                  field: errorT("fields.address"),
                  indArticleCheck: "an",
                })}
              </p>
            )}
            <input
              type="text"
              id={"newAddress"}
              name={"newAddress"}
              className="govie-input"
              aria-describedby="input-field-hint"
            />
          </div>
          <button className="govie-button" style={{ marginBottom: 0 }}>
            {t("findAddress")}
          </button>
        </form>
        <div style={{ margin: "30px 0" }}>
          <Link href={`/${locale}`} className="govie-back-link">
            {t("back")}
          </Link>
        </div>
      </div>
    </div>
  );
};
