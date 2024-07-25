import { getTranslations } from "next-intl/server";
import { routes } from "../utils";
import ds from "design-system";
import Link from "next/link";
import { AuthenticationFactory } from "../utils/authentication-factory";

export default async ({ locale }: { locale: string }) => {
  const t = await getTranslations("Entitlements");
  const mainProfile = await AuthenticationFactory.getProfileClient();
  const { data: entitlements = [], error } =
    await mainProfile.getEntitlements();

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
              key={data.documentNumber}
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
                    <strong>{data.documentNumber}</strong>
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
                    <strong>{data.issueDate}</strong>
                  </dd>
                </div>
                {data.expiryDate && (
                  <div className="govie-summary-list__row">
                    <dt
                      className="govie-summary-list__key"
                      style={{ fontWeight: "initial", width: "50%" }}
                    >
                      {t("expiryDate")}:
                    </dt>
                    <dd className="govie-summary-list__value">
                      <strong>{data.expiryDate}</strong>
                    </dd>
                  </div>
                )}
              </dl>
              <Link
                className="govie-link"
                href={`/${locale}/${routes.entitlements[data.type].path(data.documentNumber)}`}
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
