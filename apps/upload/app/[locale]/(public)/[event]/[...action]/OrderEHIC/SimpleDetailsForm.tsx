import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { form, routes, postgres, workflow } from "../../../../../utils";

export default async (props: {
  data: workflow.OrderEHIC;
  userId: string;
  urlBase: string;
  flow: string;
}) => {
  const { data, userId, urlBase, flow } = props;
  const t = await getTranslations("SimpleDetailsForm");
  const errorT = await getTranslations("formErrors");

  const errors = await form.getErrorsQuery(
    userId,
    routes.health.orderEHIC.changeDetails.slug,
    flow,
  );

  async function submitAction(formData: FormData) {
    "use server";

    const formErrors: form.Error[] = [];

    // Validations
    // Date of birth
    const dayOfBirth = parseInt(formData.get("dayOfBirth")?.toString() || "");

    const monthOfBirth = parseInt(
      formData.get("monthOfBirth")?.toString() || "",
    );
    const yearOfBirth = parseInt(formData.get("yearOfBirth")?.toString() || "");

    formErrors.push(
      ...form.validation.dateErrors(
        { field: form.fieldTranslationKeys.year, value: yearOfBirth },
        {
          field: form.fieldTranslationKeys.month,
          value: monthOfBirth,
        },
        { field: form.fieldTranslationKeys.day, value: dayOfBirth },
      ),
    );

    // Name
    const userName = formData.get("userName")?.toString();
    formErrors.push(
      ...form.validation.stringNotEmpty(
        form.fieldTranslationKeys.name,
        userName,
      ),
    );

    //PPSN
    const PPSN = formData.get("PPSN")?.toString();
    formErrors.push(
      ...form.validation.stringNotEmpty(form.fieldTranslationKeys.PPSN, PPSN),
    );

    // Sex
    const sex = formData.get("sex")?.toString();
    formErrors.push(
      ...form.validation.stringNotEmpty(form.fieldTranslationKeys.sex, sex),
    );

    if (formErrors.length) {
      await form.insertErrors(
        formErrors,
        userId,
        routes.health.orderEHIC.changeDetails.slug,
        flow,
      );

      return revalidatePath("/");
    }

    const data: Pick<
      workflow.OrderEHIC,
      | "dayOfBirth"
      | "monthOfBirth"
      | "yearOfBirth"
      | "sex"
      | "userName"
      | "PPSN"
    > = {
      dayOfBirth: "",
      monthOfBirth: "",
      sex: "",
      userName: "",
      yearOfBirth: "",
      PPSN: "",
    };

    const formIterator = formData.entries();
    let iterResult = formIterator.next();

    while (!iterResult.done) {
      const [key, value] = iterResult.value;

      if (
        [
          "dateOfBirth",
          "sex",
          "userName",
          "dayOfBirth",
          "monthOfBirth",
          "yearOfBirth",
          "PPSN",
        ].includes(key)
      ) {
        data[key] = value;
      }

      iterResult = formIterator.next();
    }

    const currentDataResults = await postgres.pgpool.query<{
      currentData: workflow.OrderEHIC;
    }>(
      `
        SELECT flow_data as "currentData" FROM user_flow_data
        WHERE user_id = $1 AND flow = $2
    `,
      [userId, workflow.keys.orderEHIC],
    );

    let dataToUpdate: workflow.OrderEHIC;
    if (currentDataResults.rowCount) {
      const [{ currentData }] = currentDataResults.rows;
      Object.assign(currentData, data);
      dataToUpdate = currentData;
    } else {
      const base: workflow.OrderEHIC = workflow.emptyOrderEHIC();
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
        workflow.keys.orderEHIC,
        JSON.stringify(dataToUpdate),
        workflow.categories.health,
      ],
    );

    return redirect(urlBase);
  }

  const nameError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.name,
  );

  const PPSNError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.PPSN,
  );

  const sexError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.sex,
  );

  const dayError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.day,
  );
  const monthError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.month,
  );
  const yearError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.year,
  );

  const dateErrors: form.Error[] = [];
  yearError && dateErrors.push(yearError);
  monthError && dateErrors.push(monthError);
  dayError && dateErrors.push(dayError);

  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds-from-desktop">
        <form action={submitAction}>
          <div
            className={`govie-form-group ${
              nameError ? "govie-form-group--error" : ""
            }`.trim()}
          >
            <h1 className="govie-label-wrapper">
              <label
                htmlFor="userName"
                className="govie-label--s govie-label--l"
              >
                {t("userName")}
              </label>
            </h1>
            {nameError && (
              <p id="input-field-error" className="govie-error-message">
                <span className="govie-visually-hidden">Error:</span>
                {errorT(nameError.messageKey, {
                  field: errorT(`fields.${nameError.field}`),
                  indArticleCheck: "",
                })}
              </p>
            )}
            <input
              type="text"
              id="userName"
              name="userName"
              className={`govie-input ${
                nameError ? "govie-input--error" : ""
              }`.trim()}
              defaultValue={nameError ? nameError.errorValue : data.userName}
            />
          </div>

          <div
            className={`govie-form-group ${
              PPSNError ? "govie-form-group--error" : ""
            }`.trim()}
          >
            <h1 className="govie-label-wrapper">
              <label htmlFor="PPSN" className="govie-label--s govie-label--l">
                {t("PPSN")}
              </label>
            </h1>
            {PPSNError && (
              <p id="input-field-error" className="govie-error-message">
                <span className="govie-visually-hidden">Error:</span>
                {errorT(PPSNError.messageKey, {
                  field: errorT(`fields.${PPSNError.field}`),
                  indArticleCheck: "",
                })}
              </p>
            )}
            <input
              type="text"
              id="PPSN"
              name="PPSN"
              className={`govie-input ${
                PPSNError ? "govie-input--error" : ""
              }`.trim()}
              defaultValue={PPSNError ? PPSNError.errorValue : data.PPSN}
            />
          </div>

          <div
            className={`govie-form-group ${
              Boolean(dateErrors.length) ? "govie-form-group--error" : ""
            }`}
          >
            <h1 className="govie-label-wrapper">
              <label
                htmlFor="dateOfBirth"
                className="govie-label--s govie-label--l"
              >
                {t("dateOfBirth")}
              </label>
            </h1>
            {Boolean(dateErrors.length) && (
              <p className="govie-error-message">
                {errorT(dateErrors.at(0)?.messageKey, {
                  field: errorT(`fields.${dateErrors.at(0)?.field}`),
                  indArticleCheck: "",
                })}
              </p>
            )}

            <div className="govie-date-input" id="example-date">
              <div className="govie-date-input__item">
                <div className="govie-form-group">
                  <label
                    className="govie-label--s govie-date-input__label"
                    htmlFor="dayOfBirth"
                  >
                    Day
                  </label>
                  <input
                    className={`govie-input govie-date-input__input govie-input--width-2 ${
                      dayError ? "govie-input--error" : ""
                    }`.trim()}
                    id="dayOfBirth"
                    name="dayOfBirth"
                    type="text"
                    inputMode="numeric"
                    defaultValue={
                      dayError ? dayError.errorValue : data.dayOfBirth
                    }
                  />
                </div>
              </div>
              <div className="govie-date-input__item">
                <div className="govie-form-group">
                  <label
                    className="govie-label--s govie-date-input__label"
                    htmlFor="monthOfBirth"
                  >
                    Month
                  </label>
                  <input
                    className={`govie-input govie-date-input__input govie-input--width-2 ${
                      monthError ? "govie-input--error" : ""
                    }`.trim()}
                    id="monthOfBirth"
                    name="monthOfBirth"
                    type="text"
                    inputMode="numeric"
                    defaultValue={
                      monthError ? monthError.errorValue : data.monthOfBirth
                    }
                  />
                </div>
              </div>
              <div className="govie-date-input__item">
                <div className="govie-form-group">
                  <label
                    className="govie-label--s govie-date-input__label"
                    htmlFor="yearOfBirth"
                  >
                    Year
                  </label>
                  <input
                    className={`govie-input govie-date-input__input govie-input--width-4 ${
                      yearError ? "govie-input--error" : ""
                    }`.trim()}
                    id="yearOfBirth"
                    name="yearOfBirth"
                    type="text"
                    inputMode="numeric"
                    defaultValue={
                      yearError ? yearError.errorValue : data.yearOfBirth
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            className={`govie-form-group ${
              sexError ? "govie-form-group--error" : ""
            }`.trim()}
          >
            <h1 className="govie-label-wrapper">
              <label htmlFor="sex" className="govie-label--s govie-label--l">
                {t("sex")}
              </label>
            </h1>
            {sexError && (
              <p id="input-field-error" className="govie-error-message">
                <span className="govie-visually-hidden">Error:</span>
                {errorT(sexError.messageKey, {
                  field: errorT(`fields.${sexError.field}`),
                  indArticleCheck: "",
                })}
              </p>
            )}
            <input
              type="text"
              id="sex"
              name="sex"
              className={`govie-input ${
                sexError ? "govie-input--error" : ""
              }`.trim()}
              defaultValue={sexError ? sexError.errorValue : data.sex}
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
