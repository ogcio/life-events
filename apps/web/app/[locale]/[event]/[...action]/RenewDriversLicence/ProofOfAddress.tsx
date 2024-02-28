import { useTranslations } from "next-intl";
import { redirect } from "next/navigation";
import ds from "design-system";
import { hexToRgba } from "../../../../utils";
import { pgpool } from "../../../../dbConnection";

export default (props: {
  step?: string;
  did?: string;
  userId: string;
  flow: string;
}) => {
  const t = useTranslations("ProofOfAddressForm");
  async function submitAction() {
    "use server";
    /**
     * This step is a bit unclear.
     *
     * Do we need a record for each new address we add for each single drivers licence renewal
     * or should it be it's own flow. Can you have multiple flows for addresses?
     * Nobody is going to add multiple addresses at the same probably?
     */

    redirect("?step=2");
  }

  async function finalSubmitAction(formData: FormData) {
    "use server";
    const identityficationSelection = formData.get("identity-selection");

    // Let's store the proofRequest state
    await pgpool.query(
      `
          UPDATE user_flow_data SET flow_data = jsonb_set(flow_data, '{proofOfAddressRequest}', $1)
          WHERE user_id = $2 AND flow = $3
      `,
      [JSON.stringify(identityficationSelection), props.userId, props.flow]
    );
    redirect("/driving/renew-licence");
  }
  if (parseInt(props?.step ?? "") === 2) {
    return (
      <>
        <div className="govie-heading-l">{t("documentsTitle")}</div>
        <p className="govie-body">{t("documentsDisclaimer")}</p>
        <form action={finalSubmitAction}>
          <div className="govie-radios govie-radios--large govie-form-group">
            <div className="govie-radios__item">
              <input
                id="utilityBill"
                name="identity-selection"
                type="radio"
                value="utilityBill"
                data-aria-controls="conditional-utilityBill"
                className="govie-radios__input"
              />
              <label
                className="govie-label--s govie-radios__label"
                htmlFor="utilityBill"
              >
                {t("utilityBill")}
              </label>
            </div>

            <div className="govie-radios__item">
              <input
                id="bankStatement"
                name="identity-selection"
                type="radio"
                value="bankStatement"
                data-aria-controls="conditional-bankStatement"
                className="govie-radios__input"
              />
              <label
                className="govie-label--s govie-radios__label"
                htmlFor="bankStatement"
              >
                {t("bankStatement")}
              </label>
            </div>

            <div className="govie-radios__item">
              <input
                id="taxDocuments"
                name="identity-selection"
                type="radio"
                value="taxDocuments"
                data-aria-controls="conditional-taxDocuments"
                className="govie-radios__input"
              />
              <label
                className="govie-label--s govie-radios__label"
                htmlFor="taxDocuments"
              >
                {t("taxDocuments")}
              </label>
            </div>

            <div className="govie-form-group">
              <label className="govie-body " htmlFor="example-file-upload">
                Please upload here
              </label>
              <div id="example-file-upload-hint" className="govie-hint"></div>
              <input
                className="govie-file-upload"
                id="example-file-upload"
                name="example-file-upload"
                type="file"
                aria-describedby="example-file-upload-hint"
                content="Choose file"
              />
            </div>

            <div className="govie-radios__divider">{t("or")}</div>

            <div className="govie-radios__item">
              <input
                id="noDocuments"
                name="identity-selection"
                type="radio"
                value="noDocuments"
                className="govie-radios__input"
              />
              <label
                className="govie-label--s govie-radios__label"
                htmlFor="noDocuments"
              >
                {t("noDocuments")}
              </label>
            </div>
          </div>
          <button type="submit" className="govie-button">
            {t("continue")}
          </button>
        </form>
      </>
    );
  }

  return (
    <div
      className="govie-notification-banner"
      style={{ backgroundColor: hexToRgba(ds.colours.ogcio.blue, 5) }}
    >
      <div
        className="govie-notification-banner__content"
        style={{ backgroundColor: hexToRgba(ds.colours.ogcio.blue, 5) }}
      >
        <div className="govie-heading-m">{t("infoTitle")}</div>
        <p className="govie-body">
          {t("instructionProof")}
          <br />
          {t("instructionRequirement")}
          <br />
          <br />
          {t("instructionDisclaimer")}
        </p>
        <details className="govie-details govie-!-font-size-16">
          <summary className="govie-details__summary">
            <span className="govie-details__summary-text">
              {t("detailsSummary")}
            </span>
          </summary>

          <div className="govie-details__text">{t("detailsText")}</div>
        </details>
        <form action={submitAction}>
          <button type="submit" className="govie-button">
            {t("continue")}
          </button>
        </form>
      </div>
    </div>
  );
};
