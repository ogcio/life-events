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
  const t = await getTranslations("GetDigitalWallet.GovernmentDetails");
  const errorT = await getTranslations("formErrors");

  const red = ds.colours.ogcio.red;

  const errors = await form.getErrorsQuery(
    props.userId,
    routes.digitalWallet.getDigitalWallet.governmentDetails.slug,
    props.flow,
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

    if (formErrors.length) {
      await form.insertErrors(
        formErrors,
        userId,
        routes.digitalWallet.getDigitalWallet.governmentDetails.slug,
        flow,
      );

      return revalidatePath("/");
    }

    const data: Pick<workflow.GetDigitalWallet, "govIEEmail"> = {
      govIEEmail: "",
    };

    const formIterator = formData.entries();
    let iterResult = formIterator.next();

    while (!iterResult.done) {
      const [key, value] = iterResult.value;

      if (["govIEEmail", "jobTitle"].includes(key)) {
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
  }

  const govIEEmailError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.govIEEmail,
  );

  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds-from-desktop">
        <h1 className="govie-heading-l">{t("title")}</h1>
        <p className="govie-heading-s">{t("subTitle")}</p>
        <form action={submitAction} style={{ maxWidth: "590px" }}>
          <p className="govie-heading-s">{t("paragraph")}</p>
          <div
            className={`govie-form-group ${
              govIEEmailError ? "govie-form-group--error" : ""
            }`.trim()}
          >
            <h1 className="govie-label-wrapper">
              <label htmlFor="email" className="govie-label--s govie-label--l">
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

          <button type="submit" className="govie-button">
            {t("submitText")}
          </button>
        </form>
      </div>
    </div>
  );
};
