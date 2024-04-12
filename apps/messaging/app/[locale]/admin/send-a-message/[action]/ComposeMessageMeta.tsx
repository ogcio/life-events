import dayjs from "dayjs";
import { api, apistub } from "messages";
import { revalidatePath } from "next/cache";
import { MessageCreateProps } from "../../../../utils/messaging";
import { PgSessions } from "auth/sessions";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";

export default async (props: MessageCreateProps) => {
  console.log(JSON.stringify(headers()));
  const t = await getTranslations("sendAMessage.ComposeMessageMeta");
  async function submit(formData: FormData) {
    "use server";

    const preferredTransportations: string[] = [];

    if (Boolean(formData.get("email"))) {
      preferredTransportations.push("email");
    }

    const messageType = formData.get("messageType")?.toString();
    if (!messageType) {
      return;
    }

    await api.upsertMessageState(
      Object.assign({}, props.state, {
        submittedMetaAt: dayjs().toISOString(),
        transportations: preferredTransportations,
        messageType,
        templateMetaId: formData.get("templateMetaId")?.toString(),
      }),
      props.userId,
      props.stateId,
    );

    console.log("We good?");
    revalidatePath("/");
  }

  const templates = await apistub.templates.getAll(
    headers().get("x-next-intl-locale") ?? "en",
  );

  return (
    <form action={submit}>
      <h1 className="govie-heading-l">{t("title")}</h1>

      <hr />

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
                defaultChecked={true}
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
                disabled
              />
              <label
                className="govie-label--s govie-checkboxes__label"
                htmlFor="organisation-2"
              >
                {t("sms")}
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

      <hr />

      <div className="govie-form-group ">
        <h3 className="govie-heading-s">{t("chooseMessageType")}</h3>

        <div className="govie-radios govie-radios--small ">
          <div className="govie-radios__item">
            <input
              id="message"
              name="messageType"
              type="radio"
              value="message"
              className="govie-radios__input"
              defaultChecked={
                !props.state.messageType ||
                props.state.messageType === "message"
              }
            />
            <label
              className="govie-label--s govie-radios__label"
              htmlFor="message"
            >
              {t("message")}
            </label>
          </div>
          <div className="govie-radios__item">
            <input
              id="event"
              name="messageType"
              type="radio"
              value="event"
              className="govie-radios__input"
              defaultChecked={props.state.messageType === "event"}
            />
            <label
              className="govie-label--s govie-radios__label"
              htmlFor="event"
            >
              {t("event")}
            </label>
          </div>
        </div>
      </div>

      <hr />

      {Boolean(templates.length) ? (
        <div className="govie-form-group">
          <h3>
            <span className="govie-heading-s">
              {t("chooseTemplateHeading")}
            </span>
          </h3>
          <select className="govie-select" name="templateMetaId">
            <option value="">{t("emptyTemplateOption")}</option>
            {templates.map((template) => (
              <option
                key={template.templateMetaId}
                value={template.templateMetaId}
              >
                {template.templateName}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <button className="govie-button" type="submit">
        {t("submitText")}
      </button>
    </form>
  );
};
