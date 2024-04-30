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
  const t = await getTranslations("GetDigitalWallet.AboutYou");
  const errorT = await getTranslations("formErrors");

  const red = ds.colours.ogcio.red;

  const errors = await form.getErrorsQuery(
    props.userId,
    routes.digitalWallet.getDigitalWallet.aboutYou.slug,
    props.flow,
  );

  async function submitAction(formData: FormData) {
    "use server";

    const formErrors: form.Error[] = [];

    const firstName = formData.get("firstName")?.toString();
    formErrors.push(
      ...form.validation.stringNotEmpty(
        form.fieldTranslationKeys.firstName,
        firstName,
      ),
    );
    const lastName = formData.get("lastName")?.toString();
    formErrors.push(
      ...form.validation.stringNotEmpty(
        form.fieldTranslationKeys.lastName,
        lastName,
      ),
    );

    const myGovIdEmail = formData.get("myGovIdEmail")?.toString();
    formErrors.push(
      ...form.validation.emailErrors(
        form.fieldTranslationKeys.myGovIdEmail,
        myGovIdEmail,
      ),
    );

    if (formErrors.length) {
      await form.insertErrors(
        formErrors,
        userId,
        routes.digitalWallet.getDigitalWallet.aboutYou.slug,
        flow,
      );

      return revalidatePath("/");
    }

    const data: Pick<
      workflow.GetDigitalWallet,
      "firstName" | "lastName" | "myGovIdEmail"
    > = {
      firstName: "",
      lastName: "",
      myGovIdEmail: "",
    };

    const formIterator = formData.entries();
    let iterResult = formIterator.next();

    while (!iterResult.done) {
      const [key, value] = iterResult.value;

      if (["firstName", "lastName", "myGovIdEmail"].includes(key)) {
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

    redirect(urlBase);
  }

  const firstNameError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.firstName,
  );

  const lastNameError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.lastName,
  );

  const myGovIdEmailError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.myGovIdEmail,
  );

  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds-from-desktop">
        <h1 className="govie-heading-l">{t("title")}</h1>
        <p className="govie-heading-s">{t("subTitle")}</p>
        <form
          action={submitAction}
          id="user-details-form"
          style={{ maxWidth: "590px" }}
        >
          <div
            className={`govie-form-group ${
              firstNameError ? "govie-form-group--error" : ""
            }`.trim()}
          >
            <h1 className="govie-label-wrapper">
              <label
                htmlFor="firstName"
                className="govie-label--s govie-label--l"
              >
                {t.rich("firstName", {
                  red: (chunks) => <span style={{ color: red }}>{chunks}</span>,
                })}
              </label>
            </h1>
            {firstNameError && (
              <p id="input-field-error" className="govie-error-message">
                <span className="govie-visually-hidden">Error:</span>
                {errorT(firstNameError.messageKey, {
                  field: errorT(`fields.${firstNameError.field}`),
                  indArticleCheck: "",
                })}
              </p>
            )}
            <input
              type="text"
              id="firstName"
              name="firstName"
              className={`govie-input ${
                firstNameError ? "govie-input--error" : ""
              }`.trim()}
              defaultValue={
                firstNameError ? firstNameError.errorValue : data.firstName
              }
            />
          </div>

          <div
            className={`govie-form-group ${
              lastNameError ? "govie-form-group--error" : ""
            }`.trim()}
          >
            <h1 className="govie-label-wrapper">
              <label
                htmlFor="lastName"
                className="govie-label--s govie-label--l"
              >
                {t.rich("lastName", {
                  red: (chunks) => <span style={{ color: red }}>{chunks}</span>,
                })}
              </label>
            </h1>
            {lastNameError && (
              <p id="input-field-error" className="govie-error-message">
                <span className="govie-visually-hidden">Error:</span>
                {errorT(lastNameError.messageKey, {
                  field: errorT(`fields.${lastNameError.field}`),
                  indArticleCheck: "",
                })}
              </p>
            )}
            <input
              type="text"
              id="lastName"
              name="lastName"
              className={`govie-input ${
                lastNameError ? "govie-input--error" : ""
              }`.trim()}
              defaultValue={
                lastNameError ? lastNameError.errorValue : data.lastName
              }
            />
          </div>

          <div
            className={`govie-form-group ${
              myGovIdEmailError ? "govie-form-group--error" : ""
            }`.trim()}
          >
            <h1 className="govie-label-wrapper">
              <label htmlFor="email" className="govie-label--s govie-label--l">
                {t.rich("myGovIdEmail", {
                  red: (chunks) => <span style={{ color: red }}>{chunks}</span>,
                })}
              </label>
            </h1>
            {myGovIdEmailError && (
              <p id="input-field-error" className="govie-error-message">
                <span className="govie-visually-hidden">Error:</span>
                {errorT(myGovIdEmailError.messageKey, {
                  field: errorT(`fields.${myGovIdEmailError.field}`),
                  indArticleCheck:
                    myGovIdEmailError.messageKey ===
                    form.errorTranslationKeys.empty
                      ? "an"
                      : "",
                })}
              </p>
            )}
            <input
              type="text"
              id="myGovIdEmail"
              name="myGovIdEmail"
              className={`govie-input ${
                myGovIdEmailError ? "govie-input--error" : ""
              }`.trim()}
              defaultValue={
                myGovIdEmailError
                  ? myGovIdEmailError.errorValue
                  : data.myGovIdEmail
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
