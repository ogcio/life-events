import { PgSessions } from "auth/sessions";
import { getTranslations } from "next-intl/server";
import { postgres, routes } from "../utils";
import ds from "design-system";
import Link from "next/link";

async function getUserEntitlements() {
  const { firstName, lastName, userId } = await PgSessions.get();

  const res = await postgres.pgpool.query<{
    type: string;
    issue_date: string;
    expiry_date: string;
    document_number: string;
    entitlementFirstName: string;
    entitlementLastName: string;
  }>(
    `SELECT type, issue_date, expiry_date, document_number, firstName as entitlementFirstName, lastName as entitlementLastName FROM user_entitlements WHERE user_id = $1`,
    [userId],
  );

  if (res.rows.length > 0) {
    return res.rows.map((row) => {
      return {
        ...row,
        firstName: row.entitlementFirstName,
        lastName: row.entitlementLastName,
      };
    });
  }

  /** the defaults below are for demo purposes only given we cannot load any real user entitlements at the moment */
  return [
    {
      firstName,
      lastName,
      type: "drivingLicence",
      issue_date: "10/09/2018",
      expiry_date: "10/09/2028",
      document_number: "MURPH0523",
    },
    {
      firstName,
      lastName,
      type: "birthCertificate",
      issue_date: "02/01/1990",
      document_number: "0523789",
    },
  ];
}

export default async () => {
  const t = await getTranslations("Entitlements");
  const entitlements = await getUserEntitlements();
  return (
    <>
      <h2 className="govie-heading-m">{t("entitlements")}</h2>
      {!entitlements.length ? (
        <p className="govie-body">{t("noEntitlements")}</p>
      ) : (
        <ul
          className="govie-list"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gridGap: "20px",
          }}
        >
          {entitlements.map((data) => (
            <li
              style={{
                border: `1px solid ${ds.colours.ogcio.midGrey}`,
                padding: "40px",
                boxSizing: "border-box",
              }}
              key={data.document_number}
            >
              <h3 style={{ marginTop: 0 }}>{t(`${data.type}`)}</h3>

              <dl className="govie-summary-list govie-summary-list--no-border">
                <div className="govie-summary-list__row">
                  <dt
                    className="govie-summary-list__key"
                    style={{ fontWeight: "initial", width: "50%" }}
                  >
                    {t("firstName")}:
                  </dt>
                  <dd className="govie-summary-list__value">
                    <strong>{data.firstName}</strong>
                  </dd>
                </div>
                <div className="govie-summary-list__row">
                  <dt
                    className="govie-summary-list__key"
                    style={{ fontWeight: "initial", width: "50%" }}
                  >
                    {t("lastName")}:
                  </dt>
                  <dd className="govie-summary-list__value">
                    <strong>{data.lastName}</strong>
                  </dd>
                </div>
                <div className="govie-summary-list__row">
                  <dt
                    className="govie-summary-list__key"
                    style={{ fontWeight: "initial", width: "50%" }}
                  >
                    {t(`${data.type}-number`)}:
                  </dt>
                  <dd className="govie-summary-list__value">
                    {" "}
                    <strong>{data.document_number}</strong>
                  </dd>
                </div>
                <div className="govie-summary-list__row">
                  <dt
                    className="govie-summary-list__key"
                    style={{ fontWeight: "initial", width: "50%" }}
                  >
                    {t("issueDate")}:
                  </dt>
                  <dd className="govie-summary-list__value">
                    {" "}
                    <strong>{data.issue_date}</strong>
                  </dd>
                </div>
                {data.expiry_date && (
                  <div className="govie-summary-list__row">
                    <dt
                      className="govie-summary-list__key"
                      style={{ fontWeight: "initial", width: "50%" }}
                    >
                      {t("expiryDate")}:
                    </dt>
                    <dd className="govie-summary-list__value">
                      <strong>{data.expiry_date}</strong>
                    </dd>
                  </div>
                )}
              </dl>
              <Link
                className="govie-link"
                href={routes.entitlements[data.type].path(data.document_number)}
              >
                {t("view")}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};
