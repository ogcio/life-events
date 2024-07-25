import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { form, routes, postgres, workflow } from "../../../../../utils";
import ds from "design-system";

export default async (props: {
  data: workflow.GetDigitalWallet;
  userId: string;
  urlBase: string;
  flow: string;
}) => {
  const { data, userId, urlBase, flow } = props;
  const t = await getTranslations("GetDigitalWallet.ChangeDetails");
  const errorT = await getTranslations("formErrors");

  const red = ds.colours.ogcio.red;

  const errors = await form.getErrorsQuery(
    userId,
    routes.digitalWallet.getDigitalWallet.changeDetails.slug,
    flow,
  );

  async function submitAction(formData: FormData) {
    "use server";

    const formErrors: form.Error[] = [];

    const govIEEmail = formData.get("govIEEmail")?.toString();
    formErrors.push(
      ...form.validation.emailErrors(
        form.fieldTranslationKeys.govIEEmail,
        govIEEmail,
      ),
    );

    const deviceType = formData.get("deviceType")?.toString() as
      | "android"
      | "ios";
    formErrors.push(
      ...form.validation.stringNotEmpty(
        form.fieldTranslationKeys.deviceType,
        deviceType,
      ),
    );

    const appStoreEmail = formData.get("appStoreEmail")?.toString();
    formErrors.push(
      ...form.validation.emailErrors(
        form.fieldTranslationKeys.appStoreEmail,
        appStoreEmail,
      ),
    );

    if (formErrors.length) {
      await form.insertErrors(
        formErrors,
        props.userId,
        routes.driving.renewDriversLicence.changeDetails.slug,
        props.flow,
      );

      return revalidatePath("/");
    }

    const data: Pick<
      workflow.GetDigitalWallet,
      "govIEEmail" | "appStoreEmail" | "deviceType"
    > = {
      govIEEmail: "",
      appStoreEmail: "",
      deviceType: "android",
    };
    const formIterator = formData.entries();
    let iterResult = formIterator.next();

    while (!iterResult.done) {
      const [key, value] = iterResult.value;
      if (["govIEEmail", "appStoreEmail", "deviceType"].includes(key)) {
        data[key] = value;
      }

      iterResult = formIterator.next();
    }

    const currentDataResults = await postgres.pgpool.query<{
      currentData: workflow.RenewDriversLicence;
    }>(
      `
        SELECT flow_data as "currentData" FROM user_flow_data
        WHERE user_id = $1 AND flow = $2
    `,
      [props.userId, workflow.keys.getDigitalWallet],
    );

    let dataToUpdate: workflow.RenewDriversLicence;
    if (currentDataResults.rowCount) {
      const [{ currentData }] = currentDataResults.rows;
      Object.assign(currentData, data);
      dataToUpdate = currentData;
    } else {
      const base: workflow.RenewDriversLicence =
        workflow.emptyRenewDriversLicence();
      Object.assign(base, data);
      dataToUpdate = base;
    }

    await postgres.pgpool.query(
      `
        INSERT INTO user_flow_data (user_id, flow, flow_data, category)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (flow, user_id)
        DO UPDATE SET flow_data = $3
        WHERE user_flow_data.user_id=$1 AND user_flow_data.flow=$2
    `,
      [
        props.userId,
        workflow.keys.getDigitalWallet,
        JSON.stringify(dataToUpdate),
        workflow.categories.digitalWallet,
      ],
    );

    return redirect(urlBase);
  }

  const govIEEmailError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.govIEEmail,
  );

  const appStoreEmailError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.appStoreEmail,
  );

  const deviceTypeError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.deviceType,
  );

  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds-from-desktop">
        <form action={submitAction} style={{ maxWidth: "590px" }}>
          <div
            className={`govie-form-group ${
              govIEEmailError ? "govie-form-group--error" : ""
            }`.trim()}
          >
            <h1 className="govie-label-wrapper">
              <label
                htmlFor="govIEEmail"
                className="govie-label--s govie-label--l"
              >
                {t.rich("govIEEmail", {
                  red: (chunks) => <span style={{ color: red }}>{chunks}</span>,
                })}
              </label>
            </h1>
            {govIEEmailError && (
              <p id="input-field-error" className="govie-error-message">
                <span className="govie-visually-hidden">Error:</span>
                {errorT(govIEEmailError.messageKey, {
                  field: errorT(`fields.${govIEEmailError.field}`),
                  indArticleCheck:
                    govIEEmailError.messageKey ===
                    form.errorTranslationKeys.empty
                      ? "an"
                      : "",
                })}
              </p>
            )}
            <input
              type="text"
              id="govIEEmail"
              name="govIEEmail"
              className={`govie-input ${
                govIEEmailError ? "govie-input--error" : ""
              }`.trim()}
              defaultValue={
                govIEEmailError ? govIEEmailError.errorValue : data.govIEEmail
              }
            />
          </div>

          <div
            className={`govie-form-group ${
              deviceTypeError ? "govie-form-group--error" : ""
            }`.trim()}
          >
            <legend className="govie-fieldset__legend govie-fieldset__legend--s">
              <p className="govie-fieldset__heading">{t("selectDeviceText")}</p>
            </legend>
            {deviceTypeError && (
              <p id="device-type-error" className="govie-error-message">
                <span className="govie-visually-hidden">Error:</span>
                {t("selectDeviceLabel")}
              </p>
            )}
            <div
              data-module="govie-radios"
              className="govie-radios govie-radios--small "
            >
              <div className="govie-radios__item">
                <input
                  defaultChecked={data.deviceType === "ios"}
                  id="device-type-0"
                  name="deviceType"
                  type="radio"
                  value="ios"
                  className="govie-radios__input"
                />
                <label className="govie-radios__label" htmlFor="device-type-0">
                  Apple iOS
                </label>
              </div>
              <div className="govie-radios__item">
                <input
                  defaultChecked={data.deviceType === "android"}
                  id="device-type-1"
                  name="deviceType"
                  type="radio"
                  value="android"
                  className="govie-radios__input"
                />
                <label className="govie-radios__label" htmlFor="device-type-1">
                  Android (eg. Samsung, Google, Huawei, Xiaomi, LG)
                </label>
              </div>
            </div>
          </div>

          <div
            className={`govie-form-group ${
              appStoreEmailError ? "govie-form-group--error" : ""
            }`.trim()}
          >
            <h1 className="govie-label-wrapper">
              <label htmlFor="email" className="govie-label--s govie-label--l">
                {t.rich("appStoreEmail", {
                  red: (chunks) => <span style={{ color: red }}>{chunks}</span>,
                })}
              </label>
            </h1>
            {appStoreEmailError && (
              <p id="input-field-error" className="govie-error-message">
                <span className="govie-visually-hidden">Error:</span>
                {errorT(appStoreEmailError.messageKey, {
                  field: errorT(`fields.${appStoreEmailError.field}`),
                  indArticleCheck:
                    appStoreEmailError.messageKey ===
                    form.errorTranslationKeys.empty
                      ? "an"
                      : "",
                })}
              </p>
            )}
            <input
              type="text"
              id="appStoreEmail"
              name="appStoreEmail"
              className={`govie-input ${
                appStoreEmailError ? "govie-input--error" : ""
              }`.trim()}
              defaultValue={
                appStoreEmailError
                  ? appStoreEmailError.errorValue
                  : data.appStoreEmail
              }
            />
          </div>

          <button type="submit" className="govie-button">
            {t("submitText")}
          </button>
        </form>
      </div>
    </div>
  );
};
