import { getTranslations } from "next-intl/server";
import { NextPageProps } from "../../../../../types";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PgSessions } from "auth/sessions";
import { formatDate, postgres } from "../../../../utils";

async function getAddress(addressId: string) {
  const { userId } = await PgSessions.get();
  const res = await postgres.pgpool.query<{
    address_id: string;
    address_line1: string;
    address_line2: string;
    town: string;
    county: string;
    eirecode: string;
    move_in_date: string;
    move_out_date: string;
  }>(
    `SELECT address_line1, address_line2, town, county, eirecode, move_in_date, move_out_date FROM user_addresses WHERE user_id = $1 AND address_id = $2`,
    [userId, addressId],
  );

  return res.rows[0];
}

async function removeAddress(formData: FormData) {
  "use server";

  const addressId = formData.get("addressId")?.toString();

  if (!addressId) {
    throw Error("Address id not found");
  }

  await postgres.pgpool.query<{ addressId: string }>(
    `
    DELETE FROM user_addresses
    WHERE address_id = $1
  `,
    [addressId],
  );

  redirect("/");
}

export default async (params: NextPageProps) => {
  const t = await getTranslations("AddressForm");
  const { id: addressId } = params.params;

  if (!addressId) {
    throw notFound();
  }

  const address = await getAddress(addressId);

  if (!address) {
    throw notFound();
  }
  return (
    <div className="govie-grid-row">
      <form action={removeAddress}>
        <input type="hidden" name="addressId" defaultValue={addressId} />
        <div className="govie-grid-column-two-thirds">
          <h1 className="govie-heading-m">{t("confirmRemoveAddress")}</h1>
          <dl className="govie-summary-list">
            <div className="govie-summary-list__row">
              <dt className="govie-summary-list__key">
                {t("firstLineOfAddress")}
              </dt>
              <dd className="govie-summary-list__value">
                {address.address_line1}
              </dd>
            </div>
            <div className="govie-summary-list__row">
              <dt className="govie-summary-list__key">
                {t("secondLineOfAddress")}
              </dt>
              <dd className="govie-summary-list__value">
                {address.address_line2}
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
                {address.move_in_date ? formatDate(address.move_in_date) : ""}
              </dd>
            </div>
            <div className="govie-summary-list__row">
              <dt className="govie-summary-list__key">{t("moveOutDate")}</dt>
              <dd className="govie-summary-list__value">
                {address.move_out_date ? formatDate(address.move_out_date) : ""}
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
