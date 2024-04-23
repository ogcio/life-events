import { PgSessions } from "auth/sessions";
import { Profile } from "building-blocks-sdk";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { NextPageProps } from "../../../../../types";
import ds from "design-system";
import { form, routes } from "../../../../utils";
import { revalidatePath } from "next/cache";

const AddressLine = ({ value }: { value: string }) => (
  <p className="govie-body" style={{ marginBottom: "5px" }}>
    {value}
  </p>
);

export default async (params: NextPageProps) => {
  const { userId } = await PgSessions.get();
  const t = await getTranslations("AddressForm");
  const errorT = await getTranslations("FormErrors");
  const { id: addressId } = params.params;

  if (!addressId) {
    throw notFound();
  }

  const { data: address, error } = await new Profile(userId).getAddress(
    addressId,
  );

  if (!address || error) {
    //handle other errors
    throw notFound();
  }
  const errors = await form.getErrorsQuery(
    userId,
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
      throw Error("Address id not found");
    }

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
      await form.insertErrors(errors, userId, routes.addresses.addDetails.slug);
      return revalidatePath("/");
    }
    console.log({ isOwner, isPrimaryAddress });
    if (isOwner !== undefined && isPrimaryAddress !== undefined) {
      const result = await new Profile(userId).updateAddress(addressId, {
        ownership_status: isOwner === "true" ? "owner" : "renting",
        is_primary: Boolean(isPrimaryAddress),
      });
      if (result?.error) {
        //handle error
      }
    }

    redirect("/");
  }

  async function cancelAction() {
    "use server";

    if (!addressId) {
      throw Error("Address id not found");
    }
    const { error } = await new Profile(userId).deleteAddress(addressId);

    if (error) {
      //handle error
    }
    redirect("/");
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
          <AddressLine value={address.address_line1} />
          {address.address_line2 && (
            <AddressLine value={address.address_line2} />
          )}
          <AddressLine value={address.town} />
          <AddressLine value={address.county} />
          <AddressLine value={address.eirecode} />
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
