import { getTranslations } from "next-intl/server";
import { PaymentRequestDetails } from "./db";
import { Payments } from "building-blocks-sdk";
import {
  paymentMethodToProviderType,
  paymentMethods,
  providerTypeToPaymentMethod,
} from "../../../utils";

async function getRegisteredAccounts(userId: string) {
  const providers = (await new Payments(userId).getProviders()).data;

  if (!providers) {
    return new Map();
  }

  const accounts = providers.reduce((acc, provider) => {
    const paymentMethod = providerTypeToPaymentMethod[provider.type];
    if (!acc.get(paymentMethod)) {
      acc.set(paymentMethod, []);
    }

    acc.get(paymentMethod).push({
      id: provider.id,
      name: provider.name,
    });

    return acc;
  }, new Map());

  return accounts;
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

  const providerAccounts = await getRegisteredAccounts(userId);

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
        {paymentMethods.map((paymentMethod, index) => {
          const provider = details?.providers.find((p) =>
            paymentMethodToProviderType[paymentMethod].includes(p.type),
          );
          return (
            <div className="govie-form-group" key={index}>
              <label
                htmlFor={`${paymentMethod}-account`}
                className="govie-label--s"
              >
                {t(`form.paymentProvider.${paymentMethod}`)}
              </label>
              <br />
              <select
                id={`${paymentMethod}-account`}
                name={`${paymentMethod}-account`}
                className="govie-select"
                defaultValue={provider?.id}
                style={{ width: "350px" }}
              >
                <option value={""}>Disabled</option>
                {(providerAccounts.get(paymentMethod) ?? []).map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
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
          <div className="govie-checkboxes__item">
            <input
              className="govie-checkboxes__input"
              id="allow-custom-hint"
              name="allowCustomAmount"
              type="checkbox"
              defaultChecked={details?.allowCustomAmount}
            />
            <label
              className="govie-label--s govie-checkboxes__label"
              htmlFor="allow-custom-hint"
            >
              {t("form.allowCustomAmount")}
            </label>
          </div>
        </div>
        <div className="govie-form-group">
          <label htmlFor="redirect-url" className="govie-label--s">
            {t("form.redirectUrl")}
          </label>
          <input
            type="text"
            id="reference"
            name="redirect-url"
            className="govie-input"
            required
            defaultValue={details?.redirectUrl}
          />
        </div>

        <input type="submit" value={tCommon("save")} className="govie-button" />
      </form>
    </div>
  );
}
