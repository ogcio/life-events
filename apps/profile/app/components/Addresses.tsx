import { getTranslations } from "next-intl/server";
import { formatDate, postgres, routes } from "../utils";
import { PgSessions } from "auth/sessions";
import ds from "design-system";
import { Link } from "../utils/navigation";

type Address = {
  address_id: string;
  address_line1: string;
  address_line2: string;
  town: string;
  county: string;
  eirecode: string;
  updated_at: string;
  move_in_date: string;
  move_out_date: string;
};

const AddressLine = ({ value }: { value: string }) => (
  <p className="govie-body" style={{ marginBottom: "5px" }}>
    {value}
  </p>
);

async function getUserAddresses() {
  const { userId } = await PgSessions.get();

  const res = await postgres.pgpool.query<Address>(
    `SELECT address_id, address_line1, address_line2, town, county, eirecode, move_in_date, move_out_date, updated_at FROM user_addresses WHERE user_id = $1`,
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

  // Addresses sorted by move in date or updated at date if move in date not set
  const sortByDates = (a: Address, b: Address) => {
    const dateA = a.move_in_date ? new Date(a.move_in_date).getTime() : null;
    const dateB = b.move_in_date ? new Date(b.move_in_date).getTime() : null;

    if (dateA !== null && dateB !== null) {
      return dateB - dateA;
    } else if (dateA === null && dateB === null) {
      return (
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    } else if (dateA === null) {
      return 1; // a should come after b
    } else {
      return -1; // a should come before b
    }
  };

  const sortedAddresses = addresses.sort(sortByDates);

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
          {sortedAddresses.map((data) => (
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
              {data.move_in_date && (
                <div>
                  <p>
                    <span style={{ marginRight: "20px" }}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="16"
                        fill="none"
                      >
                        <path
                          d="M4.8 0H12c.88 0 1.6.72 1.6 1.6v12.8c0 .88-.72 1.6-1.6 1.6H4.8c-.88 0-1.6-.72-1.6-1.6v-1.6h1.6v1.6H12V1.6H4.8v1.6H3.2V1.6C3.2.72 3.92 0 4.8 0Z"
                          fill="#004D44"
                        />
                        <path
                          d="M5.672 10.872 6.8 12l4-4-4-4-1.128 1.128L7.736 7.2H0v1.6h7.736l-2.064 2.072Z"
                          fill="#004D44"
                        />
                      </svg>
                    </span>
                    <span>{formatDate(data.move_in_date)}</span>
                  </p>
                </div>
              )}
              {data.move_out_date && (
                <div>
                  <p>
                    <span style={{ marginRight: "20px" }}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="17"
                        fill="none"
                      >
                        <path
                          d="M4.8.5H12c.88 0 1.6.72 1.6 1.6v12.8c0 .88-.72 1.6-1.6 1.6H4.8c-.88 0-1.6-.72-1.6-1.6v-1.6h1.6v1.6H12V2.1H4.8v1.6H3.2V2.1c0-.88.72-1.6 1.6-1.6Z"
                          fill="#004D44"
                        />
                        <path
                          d="M5.128 5.628 4 4.5l-4 4 4 4 1.128-1.128L3.064 9.3H10.8V7.7H3.064l2.064-2.072Z"
                          fill="#004D44"
                        />
                      </svg>
                    </span>
                    <span>{formatDate(data.move_out_date)}</span>
                  </p>
                </div>
              )}
              <div style={{ display: "flex", margin: "30px 0" }}>
                <Link
                  href={routes.addresses.editAddress.path(data.address_id)}
                  className="govie-link"
                  style={{ marginRight: "20px" }}
                >
                  {t("edit")}
                </Link>
                <Link
                  href={routes.addresses.removeAddress.path(data.address_id)}
                  className="govie-link"
                >
                  {t("remove")}
                </Link>
              </div>
              <p className="govie-body-s">
                {t("lastUpdated")}: {formatDate(data.updated_at)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};
