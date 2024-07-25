import { getTranslations } from "next-intl/server";
import { formatDate, routes } from "../utils";
import ds from "design-system";
import { Address } from "../../types/addresses";
import Link from "next/link";
import dayjs from "dayjs";
import { AuthenticationFactory } from "../utils/authentication-factory";

export default async ({ locale }: { locale: string }) => {
  const t = await getTranslations("Addresses");
  const mainProfile = await AuthenticationFactory.getProfileClient();
  const { data: addresses = [], error } = await mainProfile.getAddresses();

  if (error) {
    //handle error
  }

  // Addresses sorted by move in date or updated at date if move in date not set
  const sortByDates = (a: Address, b: Address) => {
    const dateA = a.moveInDate ? new Date(a.moveInDate).getTime() : null;
    const dateB = b.moveInDate ? new Date(b.moveInDate).getTime() : null;

    if (dateA !== null && dateB !== null) {
      return dateB - dateA;
    } else if (dateA === null && dateB === null) {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    } else if (dateA === null) {
      return 1; // a should come after b
    } else {
      return -1; // a should come before b
    }
  };

  const calculateTenancyDuration = async (
    move_in_date: Address["moveInDate"],
    move_out_date: Address["moveOutDate"],
  ) => {
    if (!move_in_date || !move_out_date) {
      return;
    }

    const start = dayjs(move_in_date);
    const end = dayjs(move_out_date);

    const monthsDiff = end.diff(start, "month");

    const years = Math.floor(monthsDiff / 12);
    const months = monthsDiff % 12;

    const translatedYears = years > 1 ? t("years") : t("year");
    const translatedMonths = months > 1 ? t("months") : t("month");

    let result = "";
    if (years > 0) {
      result += `${years} ${translatedYears}`;
    }
    if (months > 0) {
      if (years > 0) {
        result += ", ";
      }
      result += `${months} ${translatedMonths}`;
    }

    return result;
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
          href={`/${locale}/${routes.addresses.searchAddress.path()}`}
        >
          {t("addAddress")}
        </Link>
      </div>
      {!sortedAddresses.length ? (
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
              key={data.addressId}
            >
              {data.isPrimary && (
                <div
                  style={{
                    backgroundColor: ds.colours.ogcio.blue,
                    maxWidth: "fit-content",
                  }}
                >
                  <p
                    className="govie-body-s"
                    style={{
                      textTransform: "uppercase",
                      color: ds.colours.ogcio.white,
                      padding: "2px 4px",
                    }}
                  >
                    {t("primaryResidence")}
                  </p>
                </div>
              )}
              <ul className="govie-list">
                <li>{data.addressLine1}</li>
                {data.addressLine2 && <li>{data.addressLine2}</li>}
                <li> {data.town} </li>
                <li>{data.county} </li>
                <li>{data.eirecode} </li>
              </ul>
              <ul className="govie-list">
                {data.ownershipStatus && (
                  <li>
                    <span style={{ marginRight: "20px" }}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="16"
                        fill="none"
                      >
                        <path
                          d="m8.824 3.374 4.411 3.97v6.891h-1.764V8.941H6.176v5.294H4.412v-6.89l4.412-3.971Zm0-2.374L0 8.941h2.647V16h5.294v-5.294h1.765V16H15V8.941h2.647"
                          fill="#004D44"
                        />
                      </svg>
                    </span>
                    <span>{t(`${data.ownershipStatus}`)}</span>
                  </li>
                )}
                {data.moveInDate && data.moveOutDate && (
                  <li>
                    <span style={{ marginRight: "20px" }}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="17"
                        fill="none"
                      >
                        <path
                          d="M17.107.5c.493 0 .893.396.893.883v14.234a.883.883 0 0 1-.263.622.906.906 0 0 1-.63.261H.893a.9.9 0 0 1-.632-.259.877.877 0 0 1-.261-.624V1.383A.883.883 0 0 1 .263.76.906.906 0 0 1 .893.5h16.214ZM16.2 2.278H1.8v12.444h14.4V2.278Zm-1.8 8.889v1.777H3.6v-1.777h10.8ZM9 4.056v5.333H3.6V4.056H9Zm5.4 3.555V9.39h-3.6V7.61h3.6ZM7.2 5.833H5.4v1.778h1.8V5.833Zm7.2-1.777v1.777h-3.6V4.056h3.6Z"
                          fill="#004D44"
                        />
                      </svg>
                    </span>
                    <span>
                      {calculateTenancyDuration(
                        data.moveInDate,
                        data.moveOutDate,
                      )}
                    </span>
                  </li>
                )}
              </ul>

              <ul className="govie-list">
                {data.moveInDate && (
                  <li>
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
                    <span>{formatDate(data.moveInDate)}</span>
                  </li>
                )}
                {data.moveOutDate && (
                  <li>
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
                    <span>{formatDate(data.moveOutDate)}</span>
                  </li>
                )}
              </ul>
              <div style={{ display: "flex", margin: "30px 0" }}>
                <Link
                  href={`/${locale}/${routes.addresses.editAddress.path(data.addressId)}`}
                  className="govie-link"
                  style={{ marginRight: "20px" }}
                >
                  {t("edit")}
                </Link>
                <Link
                  href={`/${locale}/${routes.addresses.removeAddress.path(data.addressId)}`}
                  className="govie-link"
                >
                  {t("remove")}
                </Link>
              </div>
              <p className="govie-body-s">
                {t("lastUpdated")}: {formatDate(data.updatedAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};
