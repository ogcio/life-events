import { getTranslations } from "next-intl/server";
import { NextPageProps } from "../../../../../types";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PgSessions } from "auth/sessions";
import { formatDate } from "../../../../utils";
import { Profile } from "building-blocks-sdk";

async function removeAddress(formData: FormData) {
  "use server";

  const addressId = formData.get("addressId")?.toString();
  const userId = formData.get("userId")?.toString();

  if (!addressId) {
    throw Error("Address id not found");
  }

  if (!userId) {
    throw Error("User id not found");
  }

  const { error } = await new Profile(userId).deleteAddress(addressId);

  if (error) {
    //handle error
  }

  redirect("/");
}

export default async (params: NextPageProps) => {
  const t = await getTranslations("AddressForm");
  const { id: addressId } = params.params;
  const { userId } = await PgSessions.get();

  if (!addressId) {
    throw notFound();
  }

  const { data: address } = await new Profile(userId).getAddress(addressId);

  if (!address) {
    throw notFound();
  }
  return (
    <div className="govie-grid-row">
      <form action={removeAddress}>
        <input type="hidden" name="addressId" defaultValue={addressId} />
        <input type="hidden" name="userId" defaultValue={userId} />
        <div className="govie-grid-column-two-thirds">
          <h1 className="govie-heading-m">{t("confirmRemoveAddress")}</h1>
          <dl className="govie-summary-list">
            <div className="govie-summary-list__row">
              <dt className="govie-summary-list__key">
                {t("firstLineOfAddress")}
              </dt>
              <dd className="govie-summary-list__value">
                {address.addressLine1}
              </dd>
            </div>
            <div className="govie-summary-list__row">
              <dt className="govie-summary-list__key">
                {t("secondLineOfAddress")}
              </dt>
              <dd className="govie-summary-list__value">
                {address.addressLine2}
              </dd>
            </div>
            <div className="govie-summary-list__row">
              <dt className="govie-summary-list__key"> {t("town")}</dt>
              <dd className="govie-summary-list__value">{address.town}</dd>
            </div>
            <div className="govie-summary-list__row">
              <dt className="govie-summary-list__key">{t("county")}</dt>
              <dd className="govie-summary-list__value">{address.county}</dd>
            </div>
            <div className="govie-summary-list__row">
              <dt className="govie-summary-list__key">{t("eirecode")}</dt>
              <dd className="govie-summary-list__value">{address.eirecode}</dd>
            </div>
            <div className="govie-summary-list__row">
              <dt className="govie-summary-list__key">{t("moveInDate")}</dt>
              <dd className="govie-summary-list__value">
                {address.moveInDate ? formatDate(address.moveInDate) : ""}
              </dd>
            </div>
            <div className="govie-summary-list__row">
              <dt className="govie-summary-list__key">{t("moveOutDate")}</dt>
              <dd className="govie-summary-list__value">
                {address.moveOutDate ? formatDate(address.moveOutDate) : ""}
              </dd>
            </div>
          </dl>
          <button
            type="submit"
            className="govie-button"
            style={{ marginBottom: 0 }}
          >
            {t("remove")}
          </button>
          <div style={{ margin: "30px 0" }}>
            <Link href={"/"} className="govie-back-link">
              {t("back")}
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};
