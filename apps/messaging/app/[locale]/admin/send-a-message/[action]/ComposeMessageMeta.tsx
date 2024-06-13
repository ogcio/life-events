import dayjs from "dayjs";
import { api, temporaryMockUtils } from "messages";
import { revalidatePath } from "next/cache";
import { MessageCreateProps } from "../../../../utils/messaging";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { Messaging } from "building-blocks-sdk";
import { PgSessions } from "auth/sessions";

export default async (props: MessageCreateProps) => {
  const [t, tError] = await Promise.all([
    getTranslations("sendAMessage.ComposeMessageMeta"),
    getTranslations("formErrors"),
  ]);
  async function submit(formData: FormData) {
    "use server";

    const templateMetaId = formData.get("templateMetaId")?.toString();

    const preferredTransportations: string[] = [];

    if (Boolean(formData.get("email"))) {
      preferredTransportations.push("email");
    }

    if (Boolean(formData.get("sms"))) {
      preferredTransportations.push("sms");
    }

    if (Boolean(formData.get("life-event"))) {
      preferredTransportations.push("lifeEvent");
    }

    const errors: Parameters<typeof temporaryMockUtils.createErrors>[0] = [];

    if (!Boolean(formData.get("templateMetaId"))) {
      errors.push({
        errorValue: "",
        field: "templateMetaId",
        messageKey: "noTemplate",
      });
    }

    if (errors.length) {
      temporaryMockUtils.createErrors(
        errors,
        props.userId,
        "compose_message_meta",
      );
      return revalidatePath("/");
    }
    await api.upsertMessageState(
      Object.assign({}, props.state, {
        submittedMetaAt: dayjs().toISOString(),
        transportations: preferredTransportations,
        templateMetaId,
      }),
      props.userId,
      props.stateId,
    );

    revalidatePath("/");
  }

  const { userId } = await PgSessions.get();
  const errors = await temporaryMockUtils.getErrors(
    props.userId,
    "compose_message_meta",
  );
  const { data: templates } = await new Messaging(userId).getTemplates(
    headers().get("x-next-intl-locale") ?? "en",
  );

  const templateSelectError = errors.find(
    (err) => err.field === "templateMetaId",
  );

  return (
    <div className="govie-grid-column-two-thirds-from-desktop">
      <form action={submit}>
        <h1>
          <span style={{ margin: "unset" }} className="govie-heading-xl">
            {t("title")}
          </span>
        </h1>

        {/* Select transportation checkboxes */}
        <div className="govie-form-group">
          <h3 className="govie-heading-s">{t("chooseTransportation")}</h3>

          <fieldset className="govie-fieldset">
            <div
              className="govie-checkboxes govie-checkboxes--small"
              data-module="govie-checkboxes"
            >
              <div className="govie-checkboxes__item">
                <input
                  className="govie-checkboxes__input"
                  id="email"
                  name="email"
                  type="checkbox"
                  value="email"
                />
                <label
                  className="govie-label--s govie-checkboxes__label"
                  htmlFor="email"
                >
                  {t("email")}
                </label>
              </div>
              <div className="govie-checkboxes__item">
                <input
                  className="govie-checkboxes__input"
                  id="sms"
                  name="sms"
                  type="checkbox"
                  value="sms"
                />
                <label
                  className="govie-label--s govie-checkboxes__label"
                  htmlFor="sms"
                >
                  {t("sms")}
                </label>
              </div>
              <div className="govie-checkboxes__item">
                <input
                  className="govie-checkboxes__input"
                  id="life-event"
                  name="life-event"
                  type="checkbox"
                  value="life-event"
                />
                <label
                  className="govie-label--s govie-checkboxes__label"
                  htmlFor="life-event"
                >
                  {t("lifeEvent")}
                </label>
              </div>
              <div className="govie-checkboxes__item">
                <input
                  className="govie-checkboxes__input"
                  id="postal"
                  name="postal"
                  type="checkbox"
                  value="postal"
                  disabled
                />
                <label
                  className="govie-label--s govie-checkboxes__label"
                  htmlFor="postal"
                >
                  {t("postalService")}
                </label>
              </div>
            </div>
          </fieldset>
        </div>

        <hr className="govie-section-break govie-section-break--visible" />

        <div
          className={
            templateSelectError
              ? "govie-form-group govie-form-group--error"
              : "govie-form-group"
          }
        >
          <h3>
            <span className="govie-heading-s">
              {t("chooseTemplateHeading")}
            </span>
          </h3>
          {templateSelectError && (
            <p id="input-field-error" className="govie-error-message">
              <span className="govie-visually-hidden">Error:</span>
              {tError(templateSelectError.messageKey)}
            </p>
          )}
          <select className="govie-select" name="templateMetaId">
            <option value="">{t("emptyTemplateOption")}</option>
            {templates?.map((template) => (
              <option
                key={template.templateMetaId}
                value={template.templateMetaId}
              >
                {template.templateName}
              </option>
            ))}
          </select>
        </div>

        <button className="govie-button" type="submit">
          {t("submitText")}
        </button>
      </form>
    </div>
  );
};
