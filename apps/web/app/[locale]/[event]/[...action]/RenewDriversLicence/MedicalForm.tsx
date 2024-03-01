import {
  formConstants,
  FormError,
  getFormErrors,
  hexToRgba,
  insertFormErrors,
  urlConstants,
} from "../../../../utils";
import ds from "design-system";
import { useTranslations } from "next-intl";
import { NextPageProps } from "../types";
import { redirect } from "next/navigation";
import { pgpool } from "../../../../dbConnection";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";

async function Form(props: { userId: string; flow: string }) {
  const t = await getTranslations("MedicalForm");
  const errorT = await getTranslations("formErrors");
  async function submitAction(formData: FormData) {
    "use server";

    const formErrors: FormError[] = [];
    const medicalDocUpload = formData.get("medicalDocUpload") as File;

    if (!medicalDocUpload.size) {
      formErrors.push({
        errorValue: "",
        field: formConstants.fieldTranslationKeys.medical,
        messageKey: formConstants.errorTranslationKeys.noFile,
      });
    }

    if (formErrors.length) {
      await insertFormErrors(
        formErrors,
        props.userId,
        urlConstants.slug.medicalCertificate,
        props.flow
      );
      return revalidatePath("/");
    }

    await pgpool.query(
      `
        UPDATE user_flow_data SET flow_data = flow_data || jsonb_build_object('medicalCertificate','placeholder')
        WHERE user_id = $1 AND flow = $2
    `,
      [props.userId, props.flow]
    );
    revalidatePath("/" + urlConstants.slug.medicalCertificate);
  }

  const errors = await getFormErrors(
    props.userId,
    urlConstants.slug.medicalCertificate,
    props.flow
  );

  return (
    <>
      <div className="govie-heading-l">{t("formTitle")}</div>
      <form action={submitAction}>
        <div
          className={`govie-form-group ${
            Boolean(errors.rowCount) ? "govie-form-group--error" : ""
          }`.trim()}
        >
          {Boolean(errors.rowCount) && (
            <p id="changed-name-error" className="govie-error-message">
              <span className="govie-visually-hidden">Error:</span>
              {errorT(errors.rows.at(0)?.messageKey, {
                field: errors.rows.at(0)?.field,
              })}
            </p>
          )}
          <label className="govie-body " htmlFor="medicalDocUpload">
            {t("uploadLabel")}
          </label>
          <br />
          <input
            className="govie-file-upload"
            id="medicalDocUpload"
            name="medicalDocUpload"
            type="file"
          />
        </div>
        <button className="govie-button">{t("continue")}</button>
      </form>
    </>
  );
}

function Info() {
  const t = useTranslations("MedicalForm");

  async function submitAction() {
    "use server";
    redirect("?" + new URLSearchParams({ step: "form" }).toString());
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
        <p className="govie-body">{t("body")}</p>
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
}

export default (props: NextPageProps & { userId: string; flow: string }) => {
  return props.searchParams?.step ? (
    // @ts-expect-error Async Server Component
    <Form flow={props.flow} userId={props.userId} />
  ) : (
    <Info />
  );
};
