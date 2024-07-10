import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { form, routes, postgres, workflow } from "../../../../../utils";
import ds from "design-system";
import authenticatedAction from "../../../../../utils/authenticatedAction";

export default async (props: {
  data: workflow.GetDigitalWallet;
  userId: string;
  urlBase: string;
  flow: string;
}) => {
  const { data, userId, urlBase, flow } = props;
  const deviceType = data.deviceType as "ios" | "android";

  const t = await getTranslations("GetDigitalWallet.YourDevice");
  const tMainText = await getTranslations(
    `GetDigitalWallet.YourDevice.${deviceType}`,
  );

  const errorT = await getTranslations("formErrors");

  const red = ds.colours.ogcio.red;

  const errors = await form.getErrorsQuery(
    props.userId,
    routes.digitalWallet.getDigitalWallet.yourDevice.slug,
    props.flow,
  );

  const submitAction = authenticatedAction(async (formData: FormData) => {
    "use server";

    const formErrors: form.Error[] = [];

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
        userId,
        routes.digitalWallet.getDigitalWallet.yourDevice.slug,
        flow,
      );

      return revalidatePath("/");
    }

    const data: Pick<workflow.GetDigitalWallet, "appStoreEmail"> = {
      appStoreEmail: "",
    };

    const formIterator = formData.entries();
    let iterResult = formIterator.next();

    while (!iterResult.done) {
      const [key, value] = iterResult.value;

      if (["appStoreEmail"].includes(key)) {
        data[key] = value;
      }

      iterResult = formIterator.next();
    }

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
  });

  const appStoreEmailError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.appStoreEmail,
  );

  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds-from-desktop">
        <h1 className="govie-heading-l">{t("title")}</h1>
        <p className="govie-heading-s">{tMainText("text")}</p>
        <p className="govie-body">{tMainText("subtext")}</p>

        <ol className="govie-list govie-list--bullet">
          <li>
            <p className="govie-body">{tMainText("point-1")}</p>
          </li>
          <li>
            <p className="govie-body">{tMainText("point-2")}</p>
          </li>
          <li>
            <p className="govie-body">{tMainText("point-3")}</p>
          </li>
          {deviceType === "android" && (
            <li>
              <p className="govie-body">{tMainText("point-4")}</p>
            </li>
          )}
        </ol>

        <form action={submitAction} style={{ maxWidth: "590px" }}>
          <div
            className={`govie-form-group ${
              appStoreEmailError ? "govie-form-group--error" : ""
            }`.trim()}
          >
            <h1 className="govie-label-wrapper">
              <label
                htmlFor="appStoreEmail"
                className="govie-label--s govie-label--l"
              >
                {tMainText.rich("appStoreEmail", {
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
