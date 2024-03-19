import ds from "design-system";
import { getTranslations } from "next-intl/server";
import { postgres, routes, workflow } from "../../../../utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async (props: {
  userId: string;
  flow: string;
  onSubmitRedirectSlug: string;
}) => {
  const t = await getTranslations("NotifyDeathRequiredInfoForm");
  async function submitAction() {
    "use server";

    const dataToUpdate: workflow.NotifyDeath = {
      ...workflow.emptyNotifyDeath(),
      hasRequiredInformation: true,
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
        props.userId,
        workflow.keys.notifyDeath,
        JSON.stringify(dataToUpdate),
        workflow.categories.death,
      ],
    );

    redirect(props.onSubmitRedirectSlug);
  }

  return (
    <div
      className="govie-notification-banner"
      style={{ backgroundColor: ds.hexToRgba(ds.colours.ogcio.blue, 5) }}
    >
      <div
        className="govie-notification-banner__content"
        style={{ backgroundColor: ds.hexToRgba(ds.colours.ogcio.blue, 5) }}
      >
        <div className="govie-heading-m">{t("infoTitle")}</div>
        <ul
          className="govie-list govie-list--bullet"
          style={{ maxWidth: "100%" }}
        >
          <li>
            <p className="govie-heading-s" style={{ marginBottom: "5px" }}>
              {t("firstRequirementTitle")}
            </p>
            <p className="govie-body-s" style={{ marginTop: 0 }}>
              {t.rich("firstRequirementDescription", {
                span: (chunks) => (
                  <span style={{ display: "block" }}>{chunks}</span>
                ),
              })}
            </p>
          </li>
          <li>
            <p className="govie-heading-s">{t("secondRequirementTitle")}</p>
          </li>
          <li>
            <p className="govie-heading-s" style={{ marginBottom: "5px" }}>
              {t("thirdRequirementTitle")}
            </p>
            <p className="govie-body-s" style={{ marginTop: 0 }}>
              {t("thirdRequirementDescription")}
            </p>
          </li>
        </ul>
        <details className="govie-details govie-!-font-size-16">
          <summary className="govie-details__summary">
            <span className="govie-details__summary-text">
              {t("detailsSummary")}
            </span>
          </summary>

          <div className="govie-details__text">{t("detailsText")}</div>
        </details>
        <form action={submitAction}>
          <button type="submit" className="govie-button">
            {t("continue")}
          </button>
        </form>
      </div>
    </div>
  );
};
