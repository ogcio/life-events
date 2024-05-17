import { api } from "messages";
import { MessageCreateProps } from "../../../../utils/messaging";
import dayjs from "dayjs";
import { revalidatePath } from "next/cache";
import BackButton from "./BackButton";
import { useTranslations } from "next-intl";
import { Messaging } from "building-blocks-sdk";
import { pgpool } from "auth/sessions";

export default (props: MessageCreateProps) => {
  const t = useTranslations("sendAMessage.ScheduleForm");
  async function submit(formData: FormData) {
    "use server";

    const schedule = formData.get("schedule")?.toString();
    const year = formData.get("schedule-date-year")?.toString();
    const month = formData.get("schedule-date-month")?.toString();
    const day = formData.get("schedule-date-day")?.toString();
    const hour = formData.get("schedule-date-hour")?.toString();
    const minute = formData.get("schedule-date-minute")?.toString();

    let scheduleAt = "";
    if (schedule === "future" && year && month && day && hour && minute) {
      scheduleAt = dayjs(
        `${year}-${month}-${day} ${hour}:${minute}`,
      ).toISOString();
    } else {
      scheduleAt = dayjs().toISOString();
    }

    const messagesClient = new Messaging(props.userId);
    let message: Parameters<typeof messagesClient.createMessage>[0]["message"];
    let template: Parameters<
      typeof messagesClient.createMessage
    >[0]["template"];

    if (props.state.templateMetaId) {
      template = {
        id: props.state.templateMetaId,
        interpolations: props.state.templateInterpolations,
      };
    } else {
      message = {
        excerpt: props.state.excerpt,
        links: props.state.links,
        messageName: "",
        plainText: props.state.plainText,
        richText: props.state.richText,
        subject: props.state.subject,
        threadName: props.state.threadName,
        paymentRequestId: props.state.paymentRequestId || undefined,
        lang: props.state.lang,
      };
    }

    // TODO deconstruct error and handle
    await messagesClient.createMessage({
      message,
      template,
      preferredTransports: props.state.transportations,
      userIds: props.state.userIds,
      security: "high",
      messageType: props.state.messageType,
      scheduleAt,
    });

    await api.upsertMessageState(
      Object.assign({}, props.state, {
        confirmedScheduleAt: dayjs().toISOString(),
      }),
      props.userId,
      props.stateId,
    );

    revalidatePath("/");
  }

  async function goBack() {
    "use server";

    const next = Object.assign({}, props.state, {
      confirmedRecipientsAt: "",
    });
    try {
      await api.upsertMessageState(next, props.userId, props.stateId);
    } catch (err) {}
    revalidatePath("/");
  }

  return (
    <>
      <form action={submit}>
        <h1 className="govie-heading-l">{t("title")}</h1>

        <h3 className="govie-heading-s">{t("schedule")}</h3>
        <div id="changed-name-hint" className="govie-hint">
          {t("scheduleHint")}
        </div>

        <div className="govie-form-group" style={{ margin: "unset" }}>
          <div className="govie-radios govie-radios--small ">
            <div className="govie-radios__item">
              <input
                id="now"
                name="schedule"
                type="radio"
                value="now"
                className="govie-radios__input"
                defaultChecked
              />
              <label
                className="govie-label--s govie-radios__label"
                htmlFor="now"
              >
                {t("sendNow")}
              </label>
            </div>
          </div>
        </div>
        <hr />

        <div className="govie-form-group" style={{ margin: "unset" }}>
          <div className="govie-radios govie-radios--small ">
            <div className="govie-radios__item">
              <input
                id="future"
                name="schedule"
                type="radio"
                value="future"
                className="govie-radios__input"
              />
              <label
                className="govie-label--s govie-radios__label"
                htmlFor="future"
              >
                {t("sendLater")}
              </label>
            </div>
          </div>
        </div>
        <div className="govie-form-group">
          <fieldset
            className="govie-fieldset"
            role="group"
            aria-describedby="schedule-date-hint"
          >
            <div className="govie-date-input" id="schedule-date">
              <div className="govie-date-input__item">
                <div className="govie-form-group">
                  <label
                    className="govie-label--s govie-date-input__label"
                    htmlFor="schedule-date-day"
                  >
                    {t("day")}
                  </label>
                  <input
                    style={{ border: "2px solid gray" }}
                    className="govie-input govie-date-input__input govie-input--width-2"
                    id="schedule-date-day"
                    name="schedule-date-day"
                    type="text"
                    inputMode="numeric"
                  />
                </div>
              </div>
              <div className="govie-date-input__item">
                <div className="govie-form-group">
                  <label
                    className="govie-label--s govie-date-input__label"
                    htmlFor="schedule-date-month"
                  >
                    {t("month")}
                  </label>
                  <input
                    style={{ border: "2px solid gray" }}
                    className="govie-input govie-date-input__input govie-input--width-2"
                    id="schedule-date-month"
                    name="schedule-date-month"
                    type="text"
                    inputMode="numeric"
                  />
                </div>
              </div>
              <div className="govie-date-input__item">
                <div className="govie-form-group">
                  <label
                    className="govie-label--s govie-date-input__label"
                    htmlFor="schedule-date-year"
                  >
                    {t("year")}
                  </label>
                  <input
                    style={{ border: "2px solid gray" }}
                    className="govie-input govie-date-input__input govie-input--width-4"
                    id="schedule-date-year"
                    name="schedule-date-year"
                    type="text"
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div
                className="govie-date-input__item"
                style={{ paddingLeft: "20px" }}
              >
                <div className="govie-form-group">
                  <label
                    className="govie-label--s govie-date-input__label"
                    htmlFor="schedule-date-hour"
                  >
                    {t("hour")}
                  </label>
                  <input
                    style={{ border: "2px solid gray" }}
                    className="govie-input govie-date-input__input govie-input--width-2"
                    id="schedule-date-hour"
                    name="schedule-date-hour"
                    type="text"
                    inputMode="numeric"
                  />
                </div>
              </div>
              <div className="govie-date-input__item">
                <div className="govie-form-group">
                  <label
                    className="govie-label--s govie-date-input__label"
                    htmlFor="schedule-date-minute"
                  >
                    {t("minute")}
                  </label>
                  <input
                    style={{ border: "2px solid gray" }}
                    className="govie-input govie-date-input__input govie-input--width-2"
                    id="schedule-date-minute"
                    name="schedule-date-minute"
                    type="text"
                    inputMode="numeric"
                  />
                </div>
              </div>
            </div>
          </fieldset>
        </div>

        <button type="submit" className="govie-button">
          {t("submitText")}
        </button>
      </form>
      <form action={goBack}>
        <BackButton>{t("backLink")}</BackButton>
      </form>
    </>
  );
};
