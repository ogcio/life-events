import { getTranslations } from "next-intl/server";
import { postgres, routes } from "../utils";
import Link from "next/link";
import { PgSessions } from "auth/sessions";
import ds from "design-system";
import dayjs from "dayjs";

const AddressLine = ({ value }: { value: string }) => (
  <p className="govie-body" style={{ marginBottom: "5px" }}>
    {value}
  </p>
);

async function getUserAddresses() {
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
    `SELECT address_id, address_line1, address_line2, town, county, eirecode, updated_at FROM user_addresses WHERE user_id = $1`,
    [userId],
  );

  if (res.rows.length > 0) {
    return res.rows;
  }

  return [];
}

export default async () => {
  const t = await getTranslations("Addresses");
  const addresses = await getUserAddresses();
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
          style={{ display: "flex", alignItems: "center" }}
          href={routes.addresses.newAddress.path()}
        >
          {t("addAddress")}
        </Link>
      </div>
      {!addresses.length ? (
        <p className="govie-body">{t("noAddresses")}</p>
      ) : (
        <ul
          className="govie-list"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gridGap: "20px",
          }}
        >
          {addresses.map((data) => (
            <li
              style={{
                border: `1px solid ${ds.colours.ogcio.midGrey}`,
                padding: "40px",
                boxSizing: "border-box",
              }}
              key={data.address_id}
            >
              <AddressLine value={data.address_line1} />
              {data.address_line2 && <AddressLine value={data.address_line2} />}
              <AddressLine value={data.town} />
              <AddressLine value={data.county} />
              <AddressLine value={data.eirecode} />
              <p>
                {t("lastUpdated")}:{" "}
                {dayjs(data.updated_at).format("DD/MM/YYYY")}
              </p>
              <div style={{ display: "flex" }}>
                <Link
                  href={routes.addresses.editAddress.path(data.address_id)}
                  style={{ marginRight: "20px" }}
                >
                  {t("edit")}
                </Link>
                <Link
                  href={routes.addresses.removeAddress.path(data.address_id)}
                >
                  {t("remove")}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};
