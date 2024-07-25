import { getTranslations } from "next-intl/server";
import { NextPageProps } from "../../../../../types";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { formatDate } from "../../../../utils";
import { AuthenticationFactory } from "../../../../utils/authentication-factory";

export default async (props: NextPageProps) => {
  const t = await getTranslations("AddressForm");
  const { id: addressId, locale } = props.params;

  if (!addressId) {
    throw notFound();
  }

  const { user: mainUser, accessToken: mainToken } =
    await AuthenticationFactory.getInstance().getContext();
  const mainProfile = await AuthenticationFactory.getProfileClient({
    token: mainToken,
  });

  const { data: address } = await mainProfile.getAddress(addressId);

  if (!address) {
    throw notFound();
  }

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
    const removeProfile = await AuthenticationFactory.getProfileClient();
    const { error } = await removeProfile.deleteAddress(addressId);

    if (error) {
      //handle error
    }

    redirect(`/${locale}`);
  }

  return (
    <div className="govie-grid-row">
      <form action={removeAddress}>
        <input type="hidden" name="addressId" defaultValue={addressId} />
        <input type="hidden" name="userId" defaultValue={mainUser.id} />
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
            <Link href={`/${locale}`} className="govie-back-link">
              {t("back")}
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};
