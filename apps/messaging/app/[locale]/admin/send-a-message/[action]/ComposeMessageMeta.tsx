import dayjs from "dayjs";
import { api } from "messages";
import { revalidatePath } from "next/cache";
import { MessageCreateProps, MessageType } from "../../../../utils/messaging";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { Messaging } from "building-blocks-sdk";
import { PgSessions } from "auth/sessions";

export default async (props: MessageCreateProps) => {
  const t = await getTranslations("sendAMessage.ComposeMessageMeta");
  async function submit(formData: FormData) {
    "use server";

    const preferredTransportations: string[] = [];

    if (Boolean(formData.get("email"))) {
      preferredTransportations.push("email");
    }

    if (Boolean(formData.get("sms"))) {
      preferredTransportations.push("sms");
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

    revalidatePath("/");
  }

  const { userId } = await PgSessions.get();
  const { data: templates } = await new Messaging(userId).getTemplates(
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
              id={MessageType.Message}
              name="messageType"
              type="radio"
              value={MessageType.Message}
              className="govie-radios__input"
              defaultChecked={
                !props.state.messageType ||
                props.state.messageType === MessageType.Message
              }
            />
            <label
              className="govie-label--s govie-radios__label"
              htmlFor={MessageType.Message}
            >
              {t("message")}
            </label>
          </div>
          <div className="govie-radios__item">
            <input
              id={MessageType.Event}
              name="messageType"
              type="radio"
              value={MessageType.Event}
              className="govie-radios__input"
              defaultChecked={props.state.messageType === MessageType.Event}
            />
            <label
              className="govie-label--s govie-radios__label"
              htmlFor={MessageType.Event}
            >
              {t("event")}
            </label>
          </div>
        </div>
      </div>

      <hr />

      {Boolean(templates?.length) ? (
        <div className="govie-form-group">
          <h3>
            <span className="govie-heading-s">
              {t("chooseTemplateHeading")}
            </span>
          </h3>
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
      ) : null}

      <button className="govie-button" type="submit">
        {t("submitText")}
      </button>
    </form>
  );
};
