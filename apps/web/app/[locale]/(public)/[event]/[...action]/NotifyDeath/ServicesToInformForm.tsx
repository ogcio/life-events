import { getTranslations } from "next-intl/server";
import { postgres, form } from "../../../../../utils";
import { revalidatePath } from "next/cache";

export default async (props: {
  userId: string;
  flow: string;
  slug: string;
}) => {
  const t = await getTranslations("ServicesToInformForm");
  const errorT = await getTranslations("formErrors");

  async function submitAction(formData: FormData) {
    "use server";

    const servicesToInform = formData.getAll("servicesToInform");

    const formErrors: form.Error[] = [];

    if (!servicesToInform.length) {
      formErrors.push({
        errorValue: "",
        field: "servicesToInform",
        messageKey: form.errorTranslationKeys.emptySelection,
      });
    }

    if (formErrors.length) {
      await form.insertErrors(formErrors, props.userId, props.slug, props.flow);

      return revalidatePath("/");
    }

    await postgres.pgpool.query(
      `
            UPDATE user_flow_data SET flow_data = flow_data || jsonb_build_object('servicesToInform', $3::jsonb, 'submittedAt', now()), updated_at = now()
            WHERE user_id = $1 AND flow = $2
        `,
      [props.userId, props.flow, JSON.stringify(servicesToInform)],
    );

    revalidatePath("/");
  }

  const errors = await form.getErrorsQuery(
    props.userId,
    props.slug,
    props.flow,
  );

  const servicesResponse = await fetch(
    `${process.env.API_ENDPOINT}/static/government-services/api`,
  );
  const services = await servicesResponse.json();

  const options = services.map((service: string, index: number) => (
    <div className="govie-checkboxes__item" key={service}>
      <input
        className="govie-checkboxes__input"
        id={`servicesToInform-${index}`}
        name="servicesToInform"
        type="checkbox"
        value={service}
      />
      <label
        className="govie-label--s govie-checkboxes__label"
        htmlFor={`servicesToInform-${index}`}
      >
        {service}
      </label>
    </div>
  ));

  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds-from-desktop">
        <div className="govie-heading-l">{t("title")}</div>
        <form action={submitAction}>
          <div
            className={`govie-form-group ${
              Boolean(errors.rowCount) ? "govie-form-group--error" : ""
            }`.trim()}
          >
            {Boolean(errors.rowCount) && (
              <p className="govie-error-message">
                <span className="govie-visually-hidden">Error:</span>
                {errorT(errors.rows.at(0)?.messageKey)}
              </p>
            )}
            <div
              data-module="govie-radios"
              className="govie-radios govie-radios--large govie-radios--inline"
            >
              <div className="govie-form-group">
                <fieldset className="govie-fieldset">
                  <div
                    className="govie-checkboxes govie-checkboxes--small"
                    data-module="govie-checkboxes"
                  >
                    {options}
                  </div>
                </fieldset>
              </div>
            </div>
          </div>

          <button type="submit" className="govie-button">
            {t("confirm")}
          </button>
        </form>
      </div>
    </div>
  );
};
