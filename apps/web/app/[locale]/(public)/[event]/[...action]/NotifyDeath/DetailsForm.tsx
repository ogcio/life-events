import { getTranslations } from "next-intl/server";
import { form, postgres, routes, workflow } from "../../../../../utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async (props: {
  userId: string;
  flow: string;
  slug: string;
  data: workflow.NotifyDeath;
  onSubmitRedirectSlug: string;
}) => {
  const t = await getTranslations("NotifyDeathDetailsForm");
  const errorT = await getTranslations("formErrors");

  const errors = await form.getErrorsQuery(
    props.userId,
    routes.death.notifyDeath.details.slug,
    props.flow,
  );

  async function submitAction(formData: FormData) {
    "use server";

    const formErrors: form.Error[] = [];

    const dayOfDeath = parseInt(formData.get("dayOfDeath")?.toString() || "");

    const monthOfDeath = parseInt(
      formData.get("monthOfDeath")?.toString() || "",
    );
    const yearOfDeath = parseInt(formData.get("yearOfDeath")?.toString() || "");

    formErrors.push(
      ...form.validation.dateErrors(
        { field: form.fieldTranslationKeys.year, value: yearOfDeath },
        {
          field: form.fieldTranslationKeys.month,
          value: monthOfDeath,
        },
        { field: form.fieldTranslationKeys.day, value: dayOfDeath },
      ),
    );

    const referenceNumber = formData.get("referenceNumber")?.toString();
    formErrors.push(
      ...form.validation.stringNotEmpty(
        form.fieldTranslationKeys.referenceNumber,
        referenceNumber,
      ),
    );

    const deceasedSurname = formData.get("deceasedSurname")?.toString();
    formErrors.push(
      ...form.validation.stringNotEmpty(
        form.fieldTranslationKeys.deceasedSurname,
        deceasedSurname,
      ),
    );

    if (formErrors.length) {
      await form.insertErrors(
        formErrors,
        props.userId,
        routes.death.notifyDeath.details.slug,
        props.flow,
      );

      return revalidatePath("/");
    }

    const data: Pick<
      workflow.NotifyDeath,
      | "dayOfDeath"
      | "monthOfDeath"
      | "yearOfDeath"
      | "referenceNumber"
      | "deceasedSurname"
    > = {
      dayOfDeath: "",
      monthOfDeath: "",
      yearOfDeath: "",
      referenceNumber: "",
      deceasedSurname: "",
    };

    const formIterator = formData.entries();
    let iterResult = formIterator.next();

    while (!iterResult.done) {
      const [key, value] = iterResult.value;

      if (
        [
          "dayOfDeath",
          "monthOfDeath",
          "yearOfDeath",
          "referenceNumber",
          "deceasedSurname",
        ].includes(key)
      ) {
        data[key] = value;
      }

      iterResult = formIterator.next();
    }

    const currentDataResults = await postgres.pgpool.query<{
      currentData: workflow.NotifyDeath;
    }>(
      `
      SELECT flow_data as "currentData" FROM user_flow_data
      WHERE user_id = $1 AND flow = $2
  `,
      [props.userId, props.flow],
    );

    let dataToUpdate: workflow.NotifyDeath;
    if (currentDataResults.rowCount) {
      const [{ currentData }] = currentDataResults.rows;
      Object.assign(currentData, data);
      dataToUpdate = currentData;
    } else {
      const base: workflow.NotifyDeath = workflow.emptyNotifyDeath();
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
        props.flow,
        JSON.stringify(dataToUpdate),
        workflow.categories.death,
      ],
    );

    return redirect(props.onSubmitRedirectSlug);
  }

  const referenceNumberError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.referenceNumber,
  );
  const deceasedSurnameError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.deceasedSurname,
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
        <div className="govie-heading-l">{t("title")}</div>
        <div className="govie-warning-text">
          <span className="govie-warning-text__icon" aria-hidden="true">
            !
          </span>
          <strong className="govie-warning-text__text">
            <span className="govie-warning-text__assistive">
              {t("warning")}
            </span>
            {t("warningText")}
          </strong>
        </div>
        <form action={submitAction}>
          <div
            className={`govie-form-group ${
              referenceNumberError ? "govie-form-group--error" : ""
            }`.trim()}
          >
            <label htmlFor="first-input-field" className="govie-label--s">
              {t("firstInputTitle")}
            </label>
            <div className="govie-hint" id="first-input-field-hint">
              {t("firstInputDescription")}
            </div>
            {referenceNumberError && (
              <p id="input-field-error" className="govie-error-message">
                <span className="govie-visually-hidden">Error:</span>
                {errorT(referenceNumberError.messageKey, {
                  field: errorT(`fields.${referenceNumberError.field}`),
                  indArticleCheck: "",
                })}
              </p>
            )}
            <input
              type="text"
              id="referenceNumber"
              name="referenceNumber"
              className="govie-input"
              aria-describedby="first-input-field-hint"
              defaultValue={
                referenceNumberError
                  ? referenceNumberError.errorValue
                  : props.data.referenceNumber
              }
            />
          </div>
          <div
            className={`govie-form-group ${
              deceasedSurnameError ? "govie-form-group--error" : ""
            }`.trim()}
          >
            <label htmlFor="deceasedSurname" className="govie-label--s">
              {t("secondInputTitle")}
            </label>
            {deceasedSurnameError && (
              <p id="input-field-error" className="govie-error-message">
                <span className="govie-visually-hidden">Error:</span>
                {errorT(deceasedSurnameError.messageKey, {
                  field: errorT(`fields.${deceasedSurnameError.field}`),
                  indArticleCheck: "",
                })}
              </p>
            )}
            <input
              type="text"
              id="deceasedSurname"
              name="deceasedSurname"
              className="govie-input"
              defaultValue={
                deceasedSurnameError
                  ? deceasedSurnameError.errorValue
                  : props.data.deceasedSurname
              }
            />
          </div>

          <div
            className={`govie-form-group ${
              Boolean(dateErrors.length) ? "govie-form-group--error" : ""
            }`}
          >
            <label htmlFor="third-input-field" className="govie-label--s">
              {t("thirdInputTitle")}
            </label>
            <div className="govie-hint" id="first-input-field-hint">
              {t("thirdInputDescription")}
            </div>

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
                    htmlFor="dayOfDeath"
                  >
                    {t("day")}
                  </label>
                  <input
                    className={`govie-input govie-date-input__input govie-input--width-2 ${
                      dayError ? "govie-input--error" : ""
                    }`.trim()}
                    id="dayOfDeath"
                    name="dayOfDeath"
                    type="text"
                    inputMode="numeric"
                    defaultValue={
                      dayError ? dayError.errorValue : props.data.dayOfDeath
                    }
                  />
                </div>
              </div>
              <div className="govie-date-input__item">
                <div className="govie-form-group">
                  <label
                    className="govie-label--s govie-date-input__label"
                    htmlFor="monthOfDeath"
                  >
                    {t("month")}
                  </label>
                  <input
                    className={`govie-input govie-date-input__input govie-input--width-2 ${
                      monthError ? "govie-input--error" : ""
                    }`.trim()}
                    id="monthOfDeath"
                    name="monthOfDeath"
                    type="text"
                    inputMode="numeric"
                    defaultValue={
                      monthError
                        ? monthError.errorValue
                        : props.data.monthOfDeath
                    }
                  />
                </div>
              </div>
              <div className="govie-date-input__item">
                <div className="govie-form-group">
                  <label
                    className="govie-label--s govie-date-input__label"
                    htmlFor="yearOfDeath"
                  >
                    {t("year")}
                  </label>
                  <input
                    className={`govie-input govie-date-input__input govie-input--width-4 ${
                      yearError ? "govie-input--error" : ""
                    }`.trim()}
                    id="yearOfDeath"
                    name="yearOfDeath"
                    type="text"
                    inputMode="numeric"
                    defaultValue={
                      yearError ? yearError.errorValue : props.data.yearOfDeath
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <button type="submit" className="govie-button">
            {t("continue")}
          </button>
        </form>
      </div>
    </div>
  );
};
