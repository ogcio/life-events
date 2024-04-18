import { getTranslations } from "next-intl/server";
import { form, routes } from "../../../utils";
import { revalidatePath } from "next/cache";
import { FormProps } from "./page";
import { redirect } from "../../../utils/navigation";

export async function SearchForm(props: FormProps) {
  const { userId } = props.userData;
  const t = await getTranslations("AddressForm");
  const errorT = await getTranslations("FormErrors");
  const errors = await form.getErrorsQuery(userId);

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
      );
      return revalidatePath("/");
    }

    if (searchQuery) {
      redirect(
        `/${routes.addresses.newAddress.path()}${"?adr="}${searchQuery}`,
      );
    }
  }

  const addressError = errors.rows.at(0);

  return (
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
  );
}
