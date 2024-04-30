import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { form, routes, postgres, workflow } from "../../../../utils";

export default async (props: {
  data: workflow.GetDigitalWallet;
  userId: string;
  urlBase: string;
  flow: string;
}) => {
  const { data, userId, urlBase, flow } = props;
  const t = await getTranslations("GetDigitalWallet.ApplicationForm");
  const errorT = await getTranslations("formErrors");

  const errors = await form.getErrorsQuery(
    props.userId,
    routes.digitalWallet.getDigitalWallet.apply.slug,
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

    // appStoreEmail
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
        routes.digitalWallet.getDigitalWallet.apply.slug,
        flow,
      );

      return revalidatePath("/");
    }

    const data: Pick<
      workflow.GetDigitalWallet,
      "firstName" | "lastName" | "appStoreEmail" | "myGovIdEmail" | "govIEEmail"
    > = {
      firstName: "",
      lastName: "",
      appStoreEmail: "",
      myGovIdEmail: "",
      govIEEmail: "",
    };

    const formIterator = formData.entries();
    let iterResult = formIterator.next();

    while (!iterResult.done) {
      const [key, value] = iterResult.value;

      if (
        ["userName", "appStoreEmail", "myGovIdEmail", "govIEEmail"].includes(
          key,
        )
      ) {
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
    console.log("=== DATA TO UPDATE ===", dataToUpdate);
    // await postgres.pgpool.query(
    //   `
    //     INSERT INTO user_flow_data (user_id, flow, flow_data, category)
    //     VALUES ($1, $2, $3, $4)
    //     ON CONFLICT (flow, user_id)
    //     DO UPDATE SET flow_data = $3
    //     WHERE user_flow_data.user_id=$1 AND user_flow_data.flow=$2
    // `,
    //   [
    //     userId,
    //     workflow.keys.getDigitalWallet,
    //     JSON.stringify(dataToUpdate),
    //     workflow.categories.digitalWallet,
    //   ],
    // );

    // return redirect(urlBase);
  }

  const firstNameError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.firstName,
  );

  const lastNameError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.lastName,
  );

  const appStoreEmailError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.appStoreEmail,
  );

  const myGovIdEmailError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.myGovIdEmail,
  );

  const govIEEmailError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.govIEEmail,
  );

  const lineManagerNameError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.lineManagerName,
  );

  const jobTitleError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.firstName,
  );

  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds-from-desktop">
        <h1 className="govie-heading-l">{t("title")}</h1>
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
                {t("firstName")}
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
                {t("lastName")}
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
              appStoreEmailError ? "govie-form-group--error" : ""
            }`.trim()}
          >
            <h1 className="govie-label-wrapper">
              <label htmlFor="email" className="govie-label--s govie-label--l">
                {t("appStoreEmail")}
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

          <div
            className={`govie-form-group ${
              myGovIdEmailError ? "govie-form-group--error" : ""
            }`.trim()}
          >
            <h1 className="govie-label-wrapper">
              <label htmlFor="email" className="govie-label--s govie-label--l">
                {t("myGovIdEmail")}
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

          <div
            className={`govie-form-group ${
              govIEEmailError ? "govie-form-group--error" : ""
            }`.trim()}
          >
            <h1 className="govie-label-wrapper">
              <label htmlFor="email" className="govie-label--s govie-label--l">
                {t("govIEEmail")}
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
              lineManagerNameError ? "govie-form-group--error" : ""
            }`.trim()}
          >
            <h1 className="govie-label-wrapper">
              <label htmlFor="email" className="govie-label--s govie-label--l">
                {t("lineManagerName")}
              </label>
            </h1>
            {lineManagerNameError && (
              <p id="input-field-error" className="govie-error-message">
                <span className="govie-visually-hidden">Error:</span>
                {errorT(lineManagerNameError.messageKey, {
                  field: errorT(`fields.${lineManagerNameError.field}`),
                  indArticleCheck:
                    lineManagerNameError.messageKey ===
                    form.errorTranslationKeys.empty
                      ? "an"
                      : "",
                })}
              </p>
            )}
            <input
              type="text"
              id="lineManagerName"
              name="lineManagerName"
              className={`govie-input ${
                lineManagerNameError ? "govie-input--error" : ""
              }`.trim()}
              defaultValue={
                lineManagerNameError
                  ? lineManagerNameError.errorValue
                  : data.lineManagerName
              }
            />
          </div>

          <div
            className={`govie-form-group ${
              jobTitleError ? "govie-form-group--error" : ""
            }`.trim()}
          >
            <h1 className="govie-label-wrapper">
              <label
                htmlFor="jobTitle"
                className="govie-label--s govie-label--l"
              >
                {t("jobTitle")}
              </label>
            </h1>
            {jobTitleError && (
              <p id="input-field-error" className="govie-error-message">
                <span className="govie-visually-hidden">Error:</span>
                {errorT(jobTitleError.messageKey, {
                  field: errorT(`fields.${jobTitleError.field}`),
                  indArticleCheck: "",
                })}
              </p>
            )}
            <input
              type="text"
              id="jobTitle"
              name="jobTitle"
              className={`govie-input ${
                jobTitleError ? "govie-input--error" : ""
              }`.trim()}
              defaultValue={
                jobTitleError ? jobTitleError.errorValue : data.jobTitle
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
