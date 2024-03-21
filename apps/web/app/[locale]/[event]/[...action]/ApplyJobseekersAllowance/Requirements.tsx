import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { postgres, form } from "../../../../utils";

export default async (props: {
  userId: string;
  flow: string;
  slug: string;
}) => {
  const t = await getTranslations("ApplyJobseekersAllowanceRequirements");
  const reqT = await getTranslations(
    "ApplyJobseekersAllowanceRequirements.requirements",
  );
  const errorT = await getTranslations("formErrors");

  async function submitAction(formData: FormData) {
    "use server";

    const hasRequirements = formData.get("hasRequirements");

    const formErrors: form.Error[] = [];

    if (hasRequirements === null) {
      formErrors.push({
        errorValue: "",
        field: "hasRequirements",
        messageKey: form.errorTranslationKeys.emptySelection,
      });
    }

    if (hasRequirements === "disagree") {
      formErrors.push({
        errorValue: "",
        field: "hasRequirements",
        messageKey: form.errorTranslationKeys.noRequirements,
      });
    }

    if (formErrors.length) {
      await form.insertErrors(formErrors, props.userId, props.slug, props.flow);

      return revalidatePath("/");
    }

    if (hasRequirements === "agree") {
      await postgres.pgpool.query(
        `
          UPDATE user_flow_data SET flow_data = flow_data || jsonb_build_object('hasRequirements', true)
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
        <h1 className="govie-heading-l">{t("title")}</h1>
        <form action={submitAction}>
          <h2 className="govie-heading-m">{t("firstSubtitle")}</h2>
          <ul className="govie-list govie-list--bullet">
            {Array.from({ length: 7 }).map((_, index) => (
              <li key={reqT(`${index}`)}>
                <span className="govie-body">{reqT(`${index}`)}</span>
              </li>
            ))}
          </ul>
          <p className="govie-body govie-!-font-weight-bold">{t("note")}</p>
          <p className="govie-body">{t("firstParagraph")}</p>
          <p className="govie-body">{t("secondParagraph")}</p>
          <h2 className="govie-heading-m">{t("secondSubtitle")}</h2>

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
              <div className="govie-radios__item" style={{ paddingLeft: 0 }}>
                <div className="govie-radios__item">
                  <input
                    id="hasRequirements-agree"
                    name="hasRequirements"
                    type="radio"
                    value="agree"
                    className="govie-radios__input"
                  />
                  <label
                    className="govie-label--s govie-radios__label"
                    htmlFor="hasRequirements-agree"
                  >
                    {t("agree")}
                  </label>
                </div>
                <div className="govie-radios__item">
                  <input
                    id="hasRequirements-disagree"
                    name="hasRequirements"
                    type="radio"
                    value="disagree"
                    className="govie-radios__input"
                  />
                  <label
                    className="govie-label--s govie-radios__label"
                    htmlFor="hasRequirements-disagree"
                  >
                    {t("disagree")}
                  </label>
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
