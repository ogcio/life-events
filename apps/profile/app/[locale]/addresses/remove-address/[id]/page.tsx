import { getTranslations } from "next-intl/server";
import { NextPageProps } from "../../../../../types";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PgSessions } from "auth/sessions";
import { postgres } from "../../../../utils";

async function getAddress(addressId: string) {
  const { userId } = await PgSessions.get();
  const res = await postgres.pgpool.query<{
    address_id: string;
    address_line1: string;
    address_line2: string;
    town: string;
    county: string;
    eirecode: string;
    updated_at: string;
  }>(
    `SELECT address_line1, address_line2, town, county, eirecode FROM user_addresses WHERE user_id = $1 AND address_id = $2`,
    [userId, addressId],
  );

  return res.rows[0];
}

async function removeAddress() {}

export default async (params: NextPageProps) => {
  const t = await getTranslations("AddressForm");
  const { id } = params.params;

  if (!id) {
    throw notFound();
  }

  const address = await getAddress(id);

  if (!address) {
    throw notFound();
  }
  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds">
        <h1 className="govie-heading-l">{t("confirmRemoveAddress")}</h1>
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
        </dl>
        <button
          className="govie-button"
          style={{ marginBottom: 0 }}
          formAction={removeAddress}
        >
          {t("remove")}
        </button>
        <div style={{ margin: "30px 0" }}>
          <Link href={"/"} className="govie-back-link">
            {t("back")}
          </Link>
        </div>
      </div>
    </div>
  );
};
