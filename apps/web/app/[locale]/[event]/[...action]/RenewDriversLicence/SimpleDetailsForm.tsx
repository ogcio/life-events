import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { pgpool } from "../../../../dbConnection";
import {
  FormError,
  formValidation,
  getFormErrors,
  insertFormErrors,
  urlConstants,
} from "../../../../utils";
import {
  emptyRenewDriversLicenceFlow,
  RenewDriversLicenceFlow,
} from "../types";

const errorMap = {
  dayOfBirth: "All date fields must be filled",
  monthOfBirth: "All date fields must be filled",
  yearOfBirth: "All date fields must be filled",
};

export default async (
  props: Pick<
    RenewDriversLicenceFlow,
    | "dayOfBirth"
    | "monthOfBirth"
    | "yearOfBirth"
    | "email"
    | "mobile"
    | "sex"
    | "userName"
  > & { userId: string; urlBase: string; flow: string }
) => {
  const t = await getTranslations("CheckYourDetailsForm");
  const errorT = await getTranslations("formErrors");

  const errors = await getFormErrors(
    props.userId,
    urlConstants.slug.changeDetails,
    props.flow
  );

  async function submitAction(formData: FormData) {
    "use server";

    const formErrors: FormError[] = [];

    // Validations
    // Date of birth
    const dayOfBirth = parseInt(formData.get("dayOfBirth")?.toString() || "");
    const monthOfBirth = parseInt(
      formData.get("monthOfBirth")?.toString() || ""
    );
    const yearOfBirth = parseInt(formData.get("yearOfBirth")?.toString() || "");

    formErrors.push(
      ...formValidation.dateErrors(
        { field: "yearOfBirth", value: yearOfBirth },
        { field: "monthOfBirth", value: monthOfBirth },
        { field: "dayOfBirth", value: dayOfBirth }
      )
    );

    // Name
    const userName = formData.get("userName")?.toString();
    formErrors.push(...formValidation.stringNotEmpty("userName", userName));

    // Email
    const email = formData.get("email")?.toString();
    formErrors.push(...formValidation.emailErrors("email", email));

    // Phone
    const phone = formData.get("mobile")?.toString();
    formErrors.push(...formValidation.stringNotEmpty("mobile", phone));

    // Sex
    const sex = formData.get("sex")?.toString();
    formErrors.push(...formValidation.stringNotEmpty("sex", sex));

    if (formErrors.length) {
      await insertFormErrors(
        formErrors,
        props.userId,
        urlConstants.slug.changeDetails,
        props.flow
      );

      return revalidatePath("/");
    }

    const data: Pick<
      RenewDriversLicenceFlow,
      | "dayOfBirth"
      | "monthOfBirth"
      | "yearOfBirth"
      | "email"
      | "mobile"
      | "sex"
      | "userName"
    > = {
      dayOfBirth: "",
      email: "",
      mobile: "",
      monthOfBirth: "",
      sex: "",
      userName: "",
      yearOfBirth: "",
    };

    const formIterator = formData.entries();
    let iterResult = formIterator.next();

    while (!iterResult.done) {
      const [key, value] = iterResult.value;

      if (
        [
          "dateOfBirth",
          "email",
          "mobile",
          "sex",
          "userName",
          "dayOfBirth",
          "monthOfBirth",
          "yearOfBirth",
        ].includes(key)
      ) {
        data[key] = value;
      }

      iterResult = formIterator.next();
    }

    const currentDataResults = await pgpool.query<{
      currentData: RenewDriversLicenceFlow;
    }>(
      `
        SELECT flow_data as "currentData" FROM user_flow_data
        WHERE user_id = $1 AND flow = $2
    `,
      [props.userId, "renewDriversLicence"]
    );

    let dataToUpdate: RenewDriversLicenceFlow;
    if (currentDataResults.rowCount) {
      const [{ currentData }] = currentDataResults.rows;
      Object.assign(currentData, data);
      dataToUpdate = currentData;
    } else {
      const base: RenewDriversLicenceFlow = emptyRenewDriversLicenceFlow();
      Object.assign(base, data);
      dataToUpdate = base;
    }

    await pgpool.query(
      `
        INSERT INTO user_flow_data (user_id, flow, flow_data)
        VALUES ($1, $2, $3)
        ON CONFLICT (flow, user_id)
        DO UPDATE SET flow_data = $3
        WHERE user_flow_data.user_id=$1 AND user_flow_data.flow=$2
    `,
      [props.userId, "renewDriversLicence", JSON.stringify(dataToUpdate)]
    );

    return redirect(props.urlBase);
  }

  const dateOfBirthError = errors.rows.find((row) =>
    ["dayOfBirth", "monthOfBirth", "yearOfBirth"].includes(row.field)
  );
  const nameError = errors.rows.find((row) => row.field === "userName");
  const emailError = errors.rows.find((row) => row.field === "email");
  const phoneError = errors.rows.find((row) => row.field === "mobile");
  const sexError = errors.rows.find((row) => row.field === "sex");
  const dayError = errors.rows.find((row) => row.field === "dayOfBirth");
  const monthError = errors.rows.find((row) => row.field === "monthOfBirth");
  const yearError = errors.rows.find((row) => row.field === "yearOfBirth");

  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds-from-desktop">
        <form action={submitAction} id="user-details-form">
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
                {errorT(nameError.messageKey)}
              </p>
            )}
            <input
              type="text"
              id="userName"
              name="userName"
              className={`govie-input ${
                nameError ? "govie-input--error" : ""
              }`.trim()}
              defaultValue={nameError ? nameError.errorValue : props.userName}
            />
          </div>

          <div
            className={`govie-form-group ${
              ["dayOfBirth", "monthOfBirth", "yearOfBirth"].some((key) =>
                errors.rows?.some((row) => row.field === key)
              )
                ? "govie-form-group--error"
                : ""
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
            {dateOfBirthError && (
              <p className="govie-error-message">
                {errorT(dateOfBirthError.messageKey)}
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
                      dayError ? dayError.errorValue : props.dayOfBirth
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
                      monthError ? monthError.errorValue : props.monthOfBirth
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
                      yearError ? yearError.errorValue : props.yearOfBirth
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            className={`govie-form-group ${
              emailError ? "govie-form-group--error" : ""
            }`.trim()}
          >
            <h1 className="govie-label-wrapper">
              <label htmlFor="email" className="govie-label--s govie-label--l">
                {t("emailAddress")}
              </label>
            </h1>
            {emailError && (
              <p id="input-field-error" className="govie-error-message">
                <span className="govie-visually-hidden">Error:</span>
                {errorT(emailError.messageKey)}
              </p>
            )}
            <input
              type="text"
              id="email"
              name="email"
              className={`govie-input ${
                emailError ? "govie-input--error" : ""
              }`.trim()}
              defaultValue={emailError ? emailError.errorValue : props.email}
            />
          </div>

          <div
            className={`govie-form-group ${
              phoneError ? "govie-form-group--error" : ""
            }`.trim()}
          >
            <h1 className="govie-label-wrapper">
              <label htmlFor="mobile" className="govie-label--s govie-label--l">
                {t("mobileNumber")}
              </label>
            </h1>
            {phoneError && (
              <p id="input-field-error" className="govie-error-message">
                <span className="govie-visually-hidden">Error:</span>
                {errorT(phoneError.messageKey)}
              </p>
            )}
            <input
              type="text"
              id="mobile"
              name="mobile"
              className={`govie-input ${
                phoneError ? "govie-input--error" : ""
              }`.trim()}
              defaultValue={phoneError ? phoneError.errorValue : props.mobile}
            />
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
                {errorT(sexError.messageKey)}
              </p>
            )}
            <input
              type="text"
              id="sex"
              name="sex"
              className={`govie-input ${
                sexError ? "govie-input--error" : ""
              }`.trim()}
              defaultValue={sexError ? sexError.errorValue : props.sex}
            />
          </div>
          <button type="submit" className="govie-button">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};
