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

    const govIEEmail = formData.get("govIEEmail")?.toString();
    formErrors.push(
      ...form.validation.emailErrors(
        form.fieldTranslationKeys.govIEEmail,
        govIEEmail,
      ),
    );

    const lineManagerName = formData.get("lineManagerName")?.toString();
    formErrors.push(
      ...form.validation.stringNotEmpty(
        form.fieldTranslationKeys.lineManagerName,
        lineManagerName,
      ),
    );

    const jobTitle = formData.get("jobTitle")?.toString();
    formErrors.push(
      ...form.validation.stringNotEmpty(
        form.fieldTranslationKeys.jobTitle,
        jobTitle,
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
      | "firstName"
      | "lastName"
      | "myGovIdEmail"
      | "govIEEmail"
      | "lineManagerName"
      | "jobTitle"
      | "appStoreEmail"
    > = {
      firstName: "",
      lastName: "",
      myGovIdEmail: "",
      govIEEmail: "",
      lineManagerName: "",
      jobTitle: "",
      appStoreEmail: "",
    };
    const formIterator = formData.entries();
    let iterResult = formIterator.next();

    while (!iterResult.done) {
      const [key, value] = iterResult.value;

      if (
        [
          "firstName",
          "lastName",
          "myGovIdEmail",
          "govIEEmail",
          "lineManagerName",
          "jobTitle",
          "appStoreEmail",
        ].includes(key)
      ) {
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

  const firstNameError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.firstName,
  );

  const lastNameError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.lastName,
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
    (row) => row.field === form.fieldTranslationKeys.jobTitle,
  );

  const appStoreEmailError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.appStoreEmail,
  );

  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds-from-desktop">
        <form action={submitAction}>
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

          <div
            className={`govie-form-group ${
              lineManagerNameError ? "govie-form-group--error" : ""
            }`.trim()}
          >
            <h1 className="govie-label-wrapper">
              <label htmlFor="email" className="govie-label--s govie-label--l">
                {t.rich("lineManagerName", {
                  red: (chunks) => <span style={{ color: red }}>{chunks}</span>,
                })}
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
                {t.rich("jobTitle", {
                  red: (chunks) => <span style={{ color: red }}>{chunks}</span>,
                })}
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
