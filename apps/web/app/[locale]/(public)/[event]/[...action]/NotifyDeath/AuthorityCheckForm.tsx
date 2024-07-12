import { getTranslations } from "next-intl/server";
import { postgres, form } from "../../../../../utils";
import { revalidatePath } from "next/cache";

export default async (props: {
  userId: string;
  flow: string;
  slug: string;
}) => {
  const t = await getTranslations("AuthorityCheckForm");
  const errorT = await getTranslations("formErrors");

  async function submitAction(formData: FormData) {
    "use server";

    const hasAuthority = formData.get("hasAuthority");

    const formErrors: form.Error[] = [];

    if (hasAuthority === null) {
      formErrors.push({
        errorValue: "",
        field: "hasAuthority",
        messageKey: form.errorTranslationKeys.emptySelection,
      });
    }

    if (hasAuthority === "false") {
      formErrors.push({
        errorValue: "",
        field: "hasAuthority",
        messageKey: form.errorTranslationKeys.noAuthority,
      });
    }

    if (formErrors.length) {
      await form.insertErrors(formErrors, props.userId, props.slug, props.flow);

      return revalidatePath("/");
    }

    if (hasAuthority === "true") {
      await postgres.pgpool.query(
        `
            UPDATE user_flow_data SET flow_data = flow_data || jsonb_build_object('hasAuthority', true), updated_at = now()
            WHERE user_id = $1 AND flow = $2
        `,
        [props.userId, props.flow],
      );
      revalidatePath("/");
    }
  }

  const errors = await form.getErrorsQuery(
    props.userId,
    props.slug,
    props.flow,
  );

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
              <div
                className="govie-radios__item"
                style={{ marginBottom: "30px", paddingLeft: 0 }}
              >
                <div className="govie-radios__item">
                  <input
                    id="hasAuthority-yes"
                    name="hasAuthority"
                    type="radio"
                    value="true"
                    className="govie-radios__input"
                  />
                  <label
                    className="govie-label--s govie-radios__label"
                    htmlFor="hasAuthority-yes"
                  >
                    {t("yes")}
                  </label>
                </div>
                <div className="govie-radios__item">
                  <input
                    id="hasAuthority-no"
                    name="hasAuthority"
                    type="radio"
                    value="false"
                    className="govie-radios__input"
                  />
                  <label
                    className="govie-label--s govie-radios__label"
                    htmlFor="hasAuthority-no"
                  >
                    {t("no")}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <details className="govie-details govie-!-font-size-16">
            <summary className="govie-details__summary">
              <span className="govie-details__summary-text">
                {t("detailsSummary")}
              </span>
            </summary>

            <div className="govie-details__text">{t("detailsText")}</div>
          </details>
          <button type="submit" className="govie-button">
            {t("continue")}
          </button>
        </form>
      </div>
    </div>
  );
};
