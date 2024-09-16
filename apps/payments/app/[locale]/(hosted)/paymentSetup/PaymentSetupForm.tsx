"use client";
import { useTranslations } from "next-intl";
import { PaymentRequestDetails } from "./db";
import { paymentMethodToProviderType, paymentMethods } from "../../../utils";
import { ProvidersMap } from "./PaymentSetupFormPage";
import { useFormState } from "react-dom";
import InputField from "../../../components/InputField";
import { PaymentRequestFormState } from "./create/page";

type PaymentSetupFormProps = {
  action: (
    prevState: FormData,
    formData: FormData,
  ) => Promise<PaymentRequestFormState>;
  defaultState?: {
    details?: Partial<PaymentRequestDetails>;
    providerAccounts: ProvidersMap;
  };
};

export default function ({ action, defaultState }: PaymentSetupFormProps) {
  const t = useTranslations("PaymentSetup.CreatePayment");
  const tCommon = useTranslations("Common");

  const [state, serverAction] = useFormState(action, {
    defaultState,
    errors: {},
  });

  return (
    <form style={{ maxWidth: "500px" }} action={serverAction}>
      <h1 className="govie-heading-l">{t("title")}</h1>
      <InputField
        name="title"
        label={t("form.title")}
        error={state.errors.title}
        defaultValue={state.defaultState?.details?.title}
      />
      <div className="govie-form-group">
        <label htmlFor="description" className="govie-label--s">
          {t("form.description")}
        </label>
        <textarea
          id="description"
          name="description"
          className="govie-textarea"
          rows={5}
          defaultValue={state.defaultState?.details?.description}
        ></textarea>
      </div>
      {paymentMethods.map((paymentMethod, index) => {
        const provider = state.defaultState?.details?.providers.find((p) =>
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
              <option value={""}>{tCommon("disabled")}</option>
              {(state.defaultState.providerAccounts[paymentMethod] ?? []).map(
                (account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ),
              )}
            </select>
          </div>
        );
      })}
      <InputField
        name="reference"
        label={t("form.reference")}
        error={state.errors.reference}
        defaultValue={state.defaultState?.details?.reference}
      />
      <InputField
        type="number"
        name="amount"
        label={t("form.amount")}
        prefix={t("form.currencySymbol")}
        error={state.errors.amount}
        step="0.01"
        defaultValue={
          state.defaultState?.details?.amount
            ? (state.defaultState?.details?.amount / 100).toFixed(2)
            : undefined
        }
      />
      <div className="govie-form-group">
        <div className="govie-checkboxes__item">
          <input
            className="govie-checkboxes__input"
            id="allow-override-hint"
            name="allowAmountOverride"
            type="checkbox"
            defaultChecked={state.defaultState?.details?.allowAmountOverride}
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
            defaultChecked={state.defaultState?.details?.allowCustomAmount}
          />
          <label
            className="govie-label--s govie-checkboxes__label"
            htmlFor="allow-custom-hint"
          >
            {t("form.allowCustomAmount")}
          </label>
        </div>
      </div>
      <InputField
        name="redirect-url"
        label={t("form.redirectUrl")}
        error={state.errors.redirectUrl}
        defaultValue={state.defaultState?.details?.redirectUrl}
      />

      <div
        className={`govie-form-group ${state.errors.status && "govie-form-group--error"}`}
      >
        <legend className="govie-fieldset__legend govie-fieldset__legend--m">
          <label className="govie-label--s" htmlFor="status">
            {t("form.status.header")}
          </label>
        </legend>
        {state.errors.status && (
          <p id="input-field-error" className="govie-error-message">
            <span className="govie-visually-hidden">Error:</span>
            {state.errors.status}
          </p>
        )}
        <div
          data-module="govie-radios"
          className="govie-radios govie-radios--large"
        >
          <div className="govie-radios__item">
            <input
              id="active"
              name="status"
              type="radio"
              value="active"
              className="govie-radios__input"
              defaultChecked={
                typeof state.defaultState?.details === "undefined"
                  ? true
                  : state.defaultState?.details?.status === "active"
              }
            />
            <div className="govie-label--s govie-radios__label">
              <label htmlFor="active">{t("form.status.active")}</label>
              <p className="govie-body">{t("form.status.activeDescription")}</p>
            </div>
          </div>

          <div className="govie-radios__item">
            <input
              id="inactive"
              name="status"
              type="radio"
              value="inactive"
              className="govie-radios__input"
              defaultChecked={
                state.defaultState?.details?.status === "inactive"
              }
            />

            <div className="govie-label--s govie-radios__label">
              <label htmlFor="inactive">{t("form.status.inactive")}</label>
              <p className="govie-body">
                {t("form.status.inactiveDescription")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <input type="submit" value={tCommon("save")} className="govie-button" />

      <input
        type="hidden"
        name="providerAccounts"
        value={JSON.stringify(state.defaultState?.providerAccounts)}
      ></input>
    </form>
  );
}
