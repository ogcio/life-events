import { redirect } from "next/navigation";
import ds from "design-system";
import { form, aws, routes, postgres } from "../../../../utils";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

export default async (props: {
  step?: string;
  did?: string;
  userId: string;
  flow: string;
}) => {
  const t = await getTranslations("ProofOfAddressForm");
  const errorT = await getTranslations("formErrors");
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
    const identitySelection = formData.get("identity-selection")?.toString();

    const poaFile = formData.get("poa-file") as File;

    const formErrors: form.Error[] = [];

    if (!identitySelection) {
      formErrors.push({
        errorValue: "",
        field: "identity-selection",
        messageKey: form.errorTranslationKeys.emptySelection,
      });
    }

    if (
      identitySelection &&
      identitySelection !== "noDocuments" &&
      !poaFile.size
    ) {
      formErrors.push({
        errorValue: identitySelection,
        field: "identity-selection",
        messageKey: form.errorTranslationKeys.noFile,
      });
    }

    const s3Client = new S3Client(aws.s3ClientConfig);

    const fileId = randomUUID();
    const fileExtension = poaFile.name.split(".").at(-1);
    const fileType = "proofOfAddress";

    const awsObjectKey = `${props.userId}/${fileId}`;

    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: aws.fileBucketName,
          Key: awsObjectKey,
          Body: Buffer.from(await poaFile.arrayBuffer()),
          ContentType: poaFile.type,
        }),
      );
    } catch (err) {
      formErrors.push({
        errorValue: "fileUploadFail",
        field: "identity-selection",
        messageKey: form.errorTranslationKeys.fileUploadFail,
      });
    }

    if (formErrors.length) {
      await form.insertErrors(
        formErrors,
        props.userId,
        routes.driving.renewLicense.proofOfAddress.slug,
        props.flow,
      );

      return revalidatePath("/");
    }

    const transaction = await postgres.pgpool.connect();
    try {
      await transaction.query("BEGIN");

      // File meta
      await transaction.query(
        `
        WITH cte AS (
          SELECT upload_version FROM file_meta
          WHERE 
            file_type = 'proofOfAddress' 
            AND user_id = $1
          ORDER BY upload_version DESC
          LIMIT 1
        )
        INSERT INTO file_meta(
          user_id, 
          file_id, 
          file_type, 
          file_name_i18key, 
          file_extension, 
          upload_version)
          VALUES($1, $2, $3, $4, $5, (SELECT COALESCE((SELECT upload_version FROM cte) + 1, 1)))
      `,
        [props.userId, fileId, fileType, identitySelection, fileExtension],
      );

      // Update flow state
      await transaction.query(
        `
        UPDATE user_flow_data SET flow_data = flow_data || jsonb_build_object('proofOfAddressRequest', $1::TEXT, 'proofOfAddressFileId', $2::TEXT)
        WHERE user_id = $3 AND flow = $4
      `,
        [identitySelection, fileId, props.userId, props.flow],
      );

      await transaction.query("COMMIT");
    } catch (err) {
      await transaction.query("ROLLBACK");
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: aws.fileBucketName,
          Key: awsObjectKey,
        }),
      );
      formErrors.push({
        errorValue: "internalServerError",
        field: "internalServerError",
        messageKey: "internalServerError",
      });
    } finally {
      transaction.release();
    }

    if (formErrors.length) {
      await form.insertErrors(
        formErrors,
        props.userId,
        routes.driving.renewLicense.proofOfAddress.slug,
        props.flow,
      );

      return revalidatePath("/");
    }

    redirect("/driving/renew-licence");
  }
  if (parseInt(props?.step ?? "") === 2) {
    const errors = await form.getErrorsQuery(
      props.userId,
      routes.driving.renewLicense.proofOfAddress.slug,
      props.flow,
    );

    return (
      <>
        <div className="govie-heading-l">{t("documentsTitle")}</div>
        <form action={finalSubmitAction}>
          <div
            className={`govie-form-group ${
              Boolean(errors.rowCount) ? "govie-form-group--error" : ""
            }`.trim()}
          >
            {Boolean(errors.rowCount) && (
              <p id="changed-name-error" className="govie-error-message">
                <span className="govie-visually-hidden">Error:</span>
                {errorT(errors.rows.at(0)?.messageKey)}
              </p>
            )}
            <p className="govie-body">{t("documentsDisclaimer")}</p>
            <div className="govie-radios govie-radios--large govie-form-group">
              <div className="govie-radios__item">
                <input
                  id="utilityBill"
                  name="identity-selection"
                  type="radio"
                  value="utilityBill"
                  data-aria-controls="conditional-utilityBill"
                  className="govie-radios__input"
                  defaultChecked={
                    errors.rows.at(0)?.errorValue === "utilityBill"
                  }
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
                  defaultChecked={
                    errors.rows.at(0)?.errorValue === "bankStatement"
                  }
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
                  defaultChecked={
                    errors.rows.at(0)?.errorValue === "taxDocuments"
                  }
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
                <div id="poa-file-hint" className="govie-hint"></div>
                <input
                  className="govie-file-upload"
                  id="poa-file"
                  name="poa-file"
                  type="file"
                  aria-describedby="poa-file-hint"
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
      style={{ backgroundColor: ds.hexToRgba(ds.colours.ogcio.blue, 5) }}
    >
      <div
        className="govie-notification-banner__content"
        style={{ backgroundColor: ds.hexToRgba(ds.colours.ogcio.blue, 5) }}
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
