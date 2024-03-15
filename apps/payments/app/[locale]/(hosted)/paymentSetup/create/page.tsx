import { getTranslations } from "next-intl/server";
import { PgSessions } from "auth/sessions";
import { RedirectType, redirect } from "next/navigation";
import { pgpool } from "../../../../dbConnection";

async function getRegisteredAccounts(userId: string, providerType: string) {
  "use server";

  const accountsQueryResult = await pgpool.query<
    { provider_id: string; provider_name: string },
    string[]
  >(
    `select provider_id, provider_name from payment_providers where user_id = $1 and provider_type = $2`,
    [userId, providerType],
  );

  if (!accountsQueryResult.rowCount) {
    return [];
  }

  return accountsQueryResult.rows;
}

async function createPayment(userId: string, formData: FormData) {
  "use server";

  const amountAsString = formData.get("amount")?.toString() ?? "";
  // JS sucks at handling money
  const amount = Math.round(parseFloat(amountAsString) * 100);

  const openBankingAccount = formData.get("openbanking-account")?.toString();
  const bankTransferAccount = formData.get("banktransfer-account")?.toString();

  if (!openBankingAccount && !bankTransferAccount) {
    throw new Error("Failed to create payment");
  }

  const data = {
    title: formData.get("title")?.toString(),
    description: formData.get("description")?.toString(),
    reference: formData.get("reference")?.toString(),
    amount,
    redirectUrl: formData.get("redirect-url")?.toString(),
    allowAmountOverride: formData.get("allowAmountOverride") === "on",
  };

  const client = await pgpool.connect();

  try {
    await client.query("BEGIN");
    const paymentRequestQueryResult = await pgpool.query<{
      payment_request_id: string;
    }>(
      `insert into payment_requests (user_id, title, description, reference, amount, redirect_url, status, allow_amount_override)
        values ($1, $2, $3, $4, $5, $6, $7, $8)
        returning payment_request_id`,
      [
        userId,
        data.title,
        data.description,
        data.reference,
        data.amount,
        data.redirectUrl,
        "pending",
        data.allowAmountOverride,
      ],
    );

    if (!paymentRequestQueryResult.rowCount) {
      // handle creation failure
      throw new Error("Failed to create payment");
    }

    const paymentRequestId =
      paymentRequestQueryResult.rows[0].payment_request_id;

    if (openBankingAccount) {
      const paymentRequestProviderQueryResult = await pgpool.query<{
        payment_request_id: string;
      }>(
        `insert into payment_requests_providers (provider_id, payment_request_id)
        values ($1, $2)`,
        [openBankingAccount, paymentRequestId],
      );

      if (!paymentRequestProviderQueryResult.rowCount) {
        // handle creation failure
        throw new Error("Failed to create payment");
      }
    }

    if (bankTransferAccount) {
      const paymentRequestProviderQueryResult = await pgpool.query<{
        payment_request_id: string;
      }>(
        `insert into payment_requests_providers (provider_id, payment_request_id)
        values ($1, $2)`,
        [bankTransferAccount, paymentRequestId],
      );

      if (!paymentRequestProviderQueryResult.rowCount) {
        // handle creation failure
        throw new Error("Failed to create payment");
      }
    }
    await client.query("COMMIT");

    redirect(
      `create/${paymentRequestQueryResult.rows[0].payment_request_id}`,
      RedirectType.replace,
    );
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }
}

export default async function Page() {
  const t = await getTranslations("PaymentSetup.CreatePayment");

  const { userId } = await PgSessions.get();

  const openBankingAccounts = await getRegisteredAccounts(
    userId,
    "openbanking",
  );

  const manualBankTransferAccounts = await getRegisteredAccounts(
    userId,
    "banktransfer",
  );

  const submitPayment = createPayment.bind(this, userId);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", flex: 1 }}>
      <section
        style={{
          margin: "1rem 0",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <form style={{ maxWidth: "500px" }} action={submitPayment}>
          <h1 className="govie-heading-l">{t("title")}</h1>
          <div className="govie-form-group">
            <label htmlFor="title" className="govie-label--s">
              {t("form.title")}
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="govie-input"
              required
            />
          </div>
          <div className="govie-form-group">
            <label htmlFor="description" className="govie-label--s">
              {t("form.description")}
            </label>
            <textarea
              id="description"
              name="description"
              className="govie-textarea"
              rows={5}
            ></textarea>
          </div>
          <div className="govie-form-group">
            <label htmlFor="openbanking-account" className="govie-label--s">
              {t("form.paymentProvider.openbanking")}
            </label>
            <select
              id="openbanking-account"
              name="openbanking-account"
              className="govie-select"
            >
              <option value={""}>Disabled</option>
              {openBankingAccounts.map((account) => (
                <option key={account.provider_id} value={account.provider_id}>
                  {account.provider_name}
                </option>
              ))}
            </select>
          </div>
          <div className="govie-form-group">
            <label htmlFor="banktransfer-account" className="govie-label--s">
              {t("form.paymentProvider.banktransfer")}
            </label>
            <select
              id="banktransfer-account"
              name="banktransfer-account"
              className="govie-select"
            >
              <option value={""}>Disabled</option>
              {manualBankTransferAccounts.map((account) => (
                <option key={account.provider_id} value={account.provider_id}>
                  {account.provider_name}
                </option>
              ))}
            </select>
          </div>
          <div className="govie-form-group">
            <label htmlFor="reference" className="govie-label--s">
              {t("form.reference")}
            </label>
            <input
              type="text"
              id="reference"
              name="reference"
              className="govie-input"
              required
            />
          </div>
          <div className="govie-form-group">
            <label htmlFor="amount" className="govie-label--s">
              {t("form.amount")}
            </label>
            <div className="govie-input__wrapper">
              <div aria-hidden="true" className="govie-input__prefix">
                {t("form.currencySymbol")}
              </div>
              <input
                type="number"
                id="amount"
                name="amount"
                className="govie-input"
                min="0.00"
                max="10000.00"
                step="0.01"
                required
              />
            </div>
          </div>
          <div className="govie-form-group">
            <label htmlFor="redirect-url" className="govie-label--s">
              {t("form.redirectUrl")}
            </label>
            <input
              type="url"
              id="reference"
              name="redirect-url"
              className="govie-input"
              required
            />
          </div>
          <div className="govie-form-group">
            <div className="govie-checkboxes__item">
              <input
                className="govie-checkboxes__input"
                id="allow-override-hint"
                name="allowAmountOverride"
                type="checkbox"
              />
              <label
                className="govie-label--s govie-checkboxes__label"
                htmlFor="allow-override-hint"
              >
                {t("form.allowAmountOverride")}
              </label>
            </div>
          </div>
          <input
            type="submit"
            value={t("form.submit")}
            className="govie-button"
          />
        </form>
      </section>
    </div>
  );
}
