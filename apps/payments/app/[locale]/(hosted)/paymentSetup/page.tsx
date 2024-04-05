import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { PgSessions } from "auth/sessions";
import { getUserTransactionDetails } from "./db";
import { formatCurrency } from "../../../utils";
import SignIn from "../../../sign-in";
import SignOut from "../../../sign-out";
import { getLogtoContext, signIn, signOut } from "@logto/next/server-actions";
import { logtoConfig } from "../../../../libraries/logtoConfig";

export default async function () {
  const [t] = await Promise.all([
    getTranslations("PaymentSetup.Payments"),
    // PgSessions.get(),
  ]);

  const transactions = []; //await getUserTransactionDetails(userId);
  const { isAuthenticated } = await getLogtoContext(logtoConfig);
  return (
    <>
      <main>
        <h1>Hello Logto.</h1>
        <p>{isAuthenticated ? "Auth" : "No Auth"}</p>
        <div>
          <SignOut
            onSignOut={async () => {
              "use server";

              await signOut(logtoConfig, "http://localhost:3001/");
            }}
          />{" "}
          <SignIn
            onSignIn={async () => {
              "use server";

              await signIn(logtoConfig);
            }}
          />
        </div>
      </main>
      <div style={{ display: "flex", flexWrap: "wrap", flex: 1 }}>
        <section
          style={{
            margin: "1rem 0",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Link href="paymentSetup/create">
              <button
                id="button"
                data-module="govie-button"
                className="govie-button"
              >
                {t("createPayment")}
              </button>
            </Link>
          </div>
          <h2 className="govie-heading-m">{t("transactions")}</h2>
          <table className="govie-table">
            <thead className="govie-table__head">
              <tr className="govie-table__row">
                <th scope="col" className="govie-table__header">
                  {t("table.status")}
                </th>
                <th scope="col" className="govie-table__header">
                  {t("table.date")}
                </th>
                <th scope="col" className="govie-table__header">
                  {t("table.title")}
                </th>
                <th scope="col" className="govie-table__header">
                  {t("table.amount")}
                </th>
                <th scope="col" className="govie-table__header">
                  {t("table.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="govie-table__body">
              {transactions.map((trx) => (
                <tr className="govie-table__row" key={trx.transaction_id}>
                  <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                    <strong className="govie-tag govie-tag--green govie-body-s">
                      {trx.status}
                    </strong>
                  </td>
                  <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                    {new Date(trx.updated_at).toLocaleDateString()}
                  </td>

                  <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                    {trx.title}
                  </td>
                  <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                    {formatCurrency(trx.amount)}
                  </td>
                  <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                    <Link
                      href={`paymentSetup/transaction/${trx.transaction_id}`}
                    >
                      {t("table.details")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}
