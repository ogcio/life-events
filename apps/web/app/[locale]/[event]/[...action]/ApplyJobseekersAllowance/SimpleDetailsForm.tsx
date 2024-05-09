import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { form, routes, postgres, workflow } from "../../../../utils";

export default async (props: {
  data: workflow.ApplyJobseekersAllowance;
  userId: string;
  onSubmitRedirectSlug: string;
  flow: string;
}) => {
  const { data, userId, onSubmitRedirectSlug, flow } = props;
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

    const userName = formData.get("userName")?.toString();
    formErrors.push(
      ...form.validation.stringNotEmpty(
        form.fieldTranslationKeys.name,
        userName,
      ),
    );

    const email = formData.get("email")?.toString();
    formErrors.push(
      ...form.validation.stringNotEmpty(form.fieldTranslationKeys.email, email),
    );

    const contactNumber = formData.get("contactNumber")?.toString();
    formErrors.push(
      ...form.validation.stringNotEmpty(
        form.fieldTranslationKeys.contactNumber,
        contactNumber,
      ),
    );

    if (formErrors.length) {
      await form.insertErrors(
        formErrors,
        userId,
        routes.employment.applyJobseekersAllowance.changeDetails.slug,
        flow,
      );

      return revalidatePath("/");
    }

    const updatedData: Pick<
      workflow.ApplyJobseekersAllowance,
      "contactNumber" | "userName" | "email"
    > = {
      contactNumber: "",
      userName: "",
      email: "",
    };

    const formIterator = formData.entries();
    let iterResult = formIterator.next();

    while (!iterResult.done) {
      const [key, value] = iterResult.value;

      if (["contactNumber", "userName", "email"].includes(key)) {
        updatedData[key] = value;
      }

      iterResult = formIterator.next();
    }

    const dataToUpdate: workflow.ApplyJobseekersAllowance = {
      ...data,
      ...updatedData,
    };

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
        workflow.keys.applyJobseekersAllowance,
        JSON.stringify(dataToUpdate),
        workflow.categories.employment,
      ],
    );

    return redirect(onSubmitRedirectSlug);
  }

  const nameError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.name,
  );

  const emailError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.email,
  );

  const contactNumberError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.contactNumber,
  );

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
              emailError ? "govie-form-group--error" : ""
            }`.trim()}
          >
            <h1 className="govie-label-wrapper">
              <label htmlFor="email" className="govie-label--s govie-label--l">
                {t("email")}
              </label>
            </h1>
            {emailError && (
              <p id="input-field-error" className="govie-error-message">
                <span className="govie-visually-hidden">Error:</span>
                {errorT(emailError.messageKey, {
                  field: errorT(`fields.${emailError.field}`),
                  indArticleCheck: "",
                })}
              </p>
            )}
            <input
              type="text"
              id="email"
              name="email"
              className={`govie-input ${
                emailError ? "govie-input--error" : ""
              }`.trim()}
              defaultValue={emailError ? emailError.errorValue : data.email}
            />
          </div>

          <div
            className={`govie-form-group ${
              contactNumberError ? "govie-form-group--error" : ""
            }`.trim()}
          >
            <h1 className="govie-label-wrapper">
              <label
                htmlFor="contactNumber"
                className="govie-label--s govie-label--l"
              >
                {t("contactNumber")}
              </label>
            </h1>
            {contactNumberError && (
              <p id="input-field-error" className="govie-error-message">
                <span className="govie-visually-hidden">Error:</span>
                {errorT(contactNumberError.messageKey, {
                  field: errorT(`fields.${contactNumberError.field}`),
                  indArticleCheck: "",
                })}
              </p>
            )}
            <input
              type="text"
              id="contactNumber"
              name="contactNumber"
              className={`govie-input ${
                contactNumberError ? "govie-input--error" : ""
              }`.trim()}
              defaultValue={
                contactNumberError
                  ? contactNumberError.errorValue
                  : data.contactNumber
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
