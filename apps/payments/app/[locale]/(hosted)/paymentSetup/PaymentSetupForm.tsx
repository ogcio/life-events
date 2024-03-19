import { getTranslations } from "next-intl/server";
import { pgpool } from "../../../dbConnection";
import { PaymentRequestDetails } from "./db";

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

type PaymentSetupFormProps = {
  details?: PaymentRequestDetails;
  userId: string;
  action: (formData: FormData) => void;
};

export default async function ({
  details,
  userId,
  action,
}: PaymentSetupFormProps) {
  const t = await getTranslations("PaymentSetup.CreatePayment");
  const tCommon = await getTranslations("Common");

  const [openBankingAccounts, stripeAccounts, manualBankTransferAccounts] =
    await Promise.all([
      getRegisteredAccounts(userId, "openbanking"),
      getRegisteredAccounts(userId, "stripe"),
      getRegisteredAccounts(userId, "banktransfer"),
    ]);

  const stripeProvider = details?.providers.find(
    (provider) => provider.provider_type === "stripe",
  );
  const openBankingProvider = details?.providers.find(
    (provider) => provider.provider_type === "openbanking",
  );
  const bankTransferProvider = details?.providers.find(
    (provider) => provider.provider_type === "banktransfer",
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <form style={{ maxWidth: "500px" }} action={action}>
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
            defaultValue={details?.title}
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
            defaultValue={details?.description}
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
            defaultValue={openBankingProvider?.provider_id}
            disabled={!!openBankingProvider?.provider_id}
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
          <label htmlFor="stripe-account" className="govie-label--s">
            {t("form.paymentProvider.stripe")}
          </label>
          <select
            id="stripe-account"
            name="stripe-account"
            className="govie-select"
            defaultValue={stripeProvider?.provider_id}
            disabled={!!stripeProvider?.provider_id}
          >
            <option value={""}>Disabled</option>
            {stripeAccounts.map((account) => (
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
            defaultValue={bankTransferProvider?.provider_id}
            disabled={!!bankTransferProvider?.provider_id}
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
            defaultValue={details?.reference}
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
              defaultValue={
                details?.amount ? (details?.amount / 100).toFixed(2) : undefined
              }
            />
          </div>
        </div>
        <div className="govie-form-group">
          <div className="govie-checkboxes__item">
            <input
              className="govie-checkboxes__input"
              id="allow-override-hint"
              name="allowAmountOverride"
              type="checkbox"
              defaultChecked={details?.allowAmountOverride}
            />
            <label
              className="govie-label--s govie-checkboxes__label"
              htmlFor="allow-override-hint"
            >
              {t("form.allowAmountOverride")}
            </label>
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
            defaultValue={details?.redirect_url}
          />
        </div>

        <input type="submit" value={tCommon("save")} className="govie-button" />
      </form>
    </div>
  );
}
