import { PgSessions } from "auth/sessions";
import { getTranslations } from "next-intl/server";
import { routes } from "../utils";
import ds from "design-system";
import { Profile } from "building-blocks-sdk";
import Link from "next/link";

export default async () => {
  const t = await getTranslations("Entitlements");
  const { userId } = await PgSessions.get();
  const { data: entitlements = [], error } = await new Profile(
    userId,
  ).getEntitlements();

  if (error) {
    //handle error
  }

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
                    <strong>{data.firstname}</strong>
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
                    <strong>{data.lastname}</strong>
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
