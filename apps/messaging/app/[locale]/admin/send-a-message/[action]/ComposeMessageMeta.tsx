import dayjs from "dayjs";
import { api } from "messages";
import { revalidatePath } from "next/cache";
import { MessageCreateProps } from "../../../../utils/messaging";
import { useTranslations } from "next-intl";

export default (props: MessageCreateProps) => {
  const t = useTranslations("sendAMessage.ComposeMessageMeta");
  async function submit(formData: FormData) {
    "use server";

    const transportations: string[] = [];

    // Let's omit the choice until we have a more fine grained specification what happens if you just want to send a message within the message block
    // if (Boolean(formData.get("email"))) {
    transportations.push("email");
    // }

    const messageType = formData.get("messageType")?.toString();
    if (!messageType) {
      return;
    }

    await api.upsertMessageState(
      Object.assign({}, props.state, {
        submittedMetaAt: dayjs().toISOString(),
        transportations,
        messageType,
      }),
      props.userId,
      props.stateId,
    );

    revalidatePath("/");
  }

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
              defaultChecked
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

      <button className="govie-button" type="submit">
        {t("submitText")}
      </button>
    </form>
  );
};
