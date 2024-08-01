import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { NextPageProps } from "../../../../../types";
import ds from "design-system";
import { form, routes } from "../../../../utils";
import { revalidatePath } from "next/cache";
import { AuthenticationFactory } from "../../../../utils/authentication-factory";

export default async (props: NextPageProps) => {
  const t = await getTranslations("AddressForm");
  const errorT = await getTranslations("FormErrors");
  const { id: addressId, locale } = props.params;

  if (!addressId) {
    throw notFound();
  }

  const { user } = await AuthenticationFactory.getInstance().getContext();
  const profileClient = await AuthenticationFactory.getProfileClient();

  const { data: address, error } = await profileClient.getAddress(addressId);

  if (!address || error) {
    //handle other errors
    throw notFound();
  }
  const errors = await form.getErrorsQuery(
    user.id,
    routes.addresses.addDetails.slug,
  );

  const isOwnerError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.isOwner,
  );

  const isPrimaryAddressError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.isPrimaryAddress,
  );

  async function saveAddressDetails(formData: FormData) {
    "use server";

    if (!addressId) {
      throw notFound();
    }

    const { user: addressDetailsUser } =
      await AuthenticationFactory.getInstance().getContext();
    const addressDetailsProfile =
      await AuthenticationFactory.getProfileClient();
    const errors: form.Error[] = [];
    const isOwner = formData.get("isOwner")?.toString();
    const isPrimaryAddress = formData.get("isPrimaryAddress")?.toString();

    if (isOwner === undefined) {
      errors.push({
        messageKey: form.errorTranslationKeys.emptySelection,
        errorValue: "",
        field: form.fieldTranslationKeys.isOwner,
      });
    }

    if (isPrimaryAddress === undefined) {
      errors.push({
        messageKey: form.errorTranslationKeys.emptySelection,
        errorValue: "",
        field: form.fieldTranslationKeys.isPrimaryAddress,
      });
    }

    if (errors.length) {
      await form.insertErrors(
        errors,
        user.id,
        routes.addresses.addDetails.slug,
      );
      return revalidatePath("/");
    }

    if (isOwner !== undefined && isPrimaryAddress !== undefined) {
      const result = await addressDetailsProfile.patchAddress(addressId, {
        ownershipStatus: isOwner === "true" ? "owner" : "renting",
        isPrimary: isPrimaryAddress === "true" ? true : false,
      });
      if (result?.error) {
        //handle error
      }
    }

    redirect(`/${locale}`);
  }

  async function cancelAction() {
    "use server";

    if (!addressId) {
      throw notFound();
    }
    const profileClient = await AuthenticationFactory.getProfileClient();
    const { error } = await profileClient.deleteAddress(addressId);

    if (error) {
      //handle error
    }
    redirect(`/${locale}`);
  }

  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds">
        <h1 className="govie-heading-l">{t("newAddress")}</h1>
        <div
          style={{
            border: `1px solid ${ds.colours.ogcio.midGrey}`,
            padding: "40px",
            marginBottom: "30px",
          }}
        >
          <ul className="govie-list">
            <li>{address.addressLine1}</li>
            {address.addressLine2 && <li>{address.addressLine2}</li>}
            <li>{address.town}</li>
            <li>{address.county}</li>
            <li>{address.eirecode}</li>
          </ul>
        </div>
        <form action={saveAddressDetails}>
          <h2 className="govie-heading-m">{t("ownerOrRenting")}</h2>
          <div
            className={`govie-form-group ${
              isOwnerError ? "govie-form-group--error" : ""
            }`.trim()}
          >
            {isOwnerError && (
              <p className="govie-error-message">
                <span className="govie-visually-hidden">{t("error")}:</span>
                {errorT(isOwnerError.messageKey)}
              </p>
            )}
            <div
              data-module="govie-radios"
              className="govie-radios govie-radios--large govie-radios--inline"
            >
              <div
                className="govie-radios__item"
                style={{ marginBottom: "30px", paddingLeft: 0 }}
              >
                <div className="govie-radios__item">
                  <input
                    id="isOwner-yes"
                    name="isOwner"
                    type="radio"
                    value="true"
                    className="govie-radios__input"
                  />
                  <label
                    className="govie-label--s govie-radios__label"
                    htmlFor="isOwner-yes"
                  >
                    {t("owner")}
                  </label>
                </div>
                <div className="govie-radios__item">
                  <input
                    id="isOwner-no"
                    name="isOwner"
                    type="radio"
                    value="false"
                    className="govie-radios__input"
                  />
                  <label
                    className="govie-label--s govie-radios__label"
                    htmlFor="isOwner-no"
                  >
                    {t("renting")}
                  </label>
                </div>
              </div>
            </div>
          </div>
          <h2 className="govie-heading-m">{t("isPrimaryResidence")}</h2>
          <div
            className={`govie-form-group ${
              isPrimaryAddressError ? "govie-form-group--error" : ""
            }`.trim()}
          >
            {isPrimaryAddressError && (
              <p className="govie-error-message">
                <span className="govie-visually-hidden">Error:</span>
                {errorT(isPrimaryAddressError.messageKey)}
              </p>
            )}
            <div
              data-module="govie-radios"
              className="govie-radios govie-radios--large govie-radios--inline"
            >
              <div
                className="govie-radios__item"
                style={{ marginBottom: "30px", paddingLeft: 0 }}
              >
                <div className="govie-radios__item">
                  <input
                    id="isPrimaryAddress-yes"
                    name="isPrimaryAddress"
                    type="radio"
                    value="true"
                    className="govie-radios__input"
                  />
                  <label
                    className="govie-label--s govie-radios__label"
                    htmlFor="isPrimaryAddress-yes"
                  >
                    {t("yes")}
                  </label>
                </div>
                <div className="govie-radios__item">
                  <input
                    id="isPrimaryAddress-no"
                    name="isPrimaryAddress"
                    type="radio"
                    value="false"
                    className="govie-radios__input"
                  />
                  <label
                    className="govie-label--s govie-radios__label"
                    htmlFor="isPrimaryAddress-no"
                  >
                    {t("no")}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "center",
              marginBottom: "30px",
            }}
          >
            <button
              type="submit"
              data-module="govie-button"
              className="govie-button"
              style={{ marginBottom: 0 }}
            >
              {t("save")}
            </button>
            <button
              data-module="govie-button"
              className="govie-button govie-button--secondary"
              style={{ marginBottom: 0 }}
              formAction={cancelAction}
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
