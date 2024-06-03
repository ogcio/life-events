import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { form, routes, postgres, workflow } from "../../../../utils";
import ds from "design-system";

export default async (props: {
  data: workflow.GetDigitalWallet;
  userId: string;
  urlBase: string;
  flow: string;
}) => {
  const { data, userId, urlBase, flow } = props;
  const t = await getTranslations("GetDigitalWallet.DeviceSelection");
  const errorT = await getTranslations("formErrors");

  const red = ds.colours.ogcio.red;

  const errors = await form.getErrorsQuery(
    props.userId,
    routes.digitalWallet.getDigitalWallet.deviceSelection.slug,
    props.flow,
  );

  async function submitAction(formData: FormData) {
    "use server";

    const formErrors: form.Error[] = [];

    const deviceType = formData.get("deviceType")?.toString() as
      | "android"
      | "ios";
    formErrors.push(
      ...form.validation.stringNotEmpty(
        form.fieldTranslationKeys.deviceType,
        deviceType,
      ),
    );

    if (formErrors.length) {
      await form.insertErrors(
        formErrors,
        userId,
        routes.digitalWallet.getDigitalWallet.deviceSelection.slug,
        flow,
      );

      return revalidatePath("/");
    }

    const data: Pick<workflow.GetDigitalWallet, "deviceType"> = {
      deviceType,
    };

    const currentDataResults = await postgres.pgpool.query<{
      currentData: workflow.GetDigitalWallet;
    }>(
      `
      SELECT flow_data as "currentData" FROM user_flow_data
      WHERE user_id = $1 AND flow = $2
      `,
      [userId, workflow.keys.getDigitalWallet],
    );

    let dataToUpdate: workflow.GetDigitalWallet;
    if (currentDataResults.rowCount) {
      const [{ currentData }] = currentDataResults.rows;
      Object.assign(currentData, data);
      dataToUpdate = currentData;
    } else {
      const base: workflow.GetDigitalWallet = workflow.emptyGetDigitalWallet();
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
        userId,
        workflow.keys.getDigitalWallet,
        JSON.stringify(dataToUpdate),
        workflow.categories.digitalWallet,
      ],
    );

    return redirect(urlBase);
  }

  const deviceTypeError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.deviceType,
  );

  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds-from-desktop">
        <h1 className="govie-heading-l">{t("title")}</h1>
        <p className="govie-heading-s">{t("subTitle")}</p>
        <form action={submitAction} style={{ maxWidth: "590px" }}>
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
                <span className="govie-visually-hidden">Error:</span>Select an
                option
              </p>
            )}
            <div
              data-module="govie-radios"
              className="govie-radios govie-radios--small "
            >
              <div className="govie-radios__item">
                <input
                  id="device-type-0"
                  name="deviceType"
                  type="radio"
                  value="ios"
                  className="govie-radios__input"
                />
                <label className="govie-radios__label" htmlFor="device-type-0">
                  {t("ios")}
                </label>
              </div>
              <div className="govie-radios__item">
                <input
                  id="device-type-1"
                  name="deviceType"
                  type="radio"
                  value="android"
                  className="govie-radios__input"
                />
                <label className="govie-radios__label" htmlFor="device-type-1">
                  {t("android")}
                </label>
              </div>
            </div>
          </div>

          <button type="submit" className="govie-button">
            {t("submitText")}
          </button>
        </form>
      </div>
    </div>
  );
};
