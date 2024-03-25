import { api } from "messages";
import { MessageCreateProps } from "../../../utils/messaging";
import dayjs from "dayjs";
import { revalidatePath } from "next/cache";
import BackButton from "./BackButton";
import { useTranslations } from "next-intl";

export default (props: MessageCreateProps) => {
  const t = useTranslations("sendAMessage.ScheduleForm");
  async function submit() {
    "use server";
    await api.upsertMessageState(
      Object.assign({}, props.state, {
        confirmedScheduleAt: dayjs().toISOString(),
      }),
      props.userId,
      props.stateId,
    );

    const data: Parameters<typeof api.pushMessage>[0]["data"] = {
      content: props.state.content,
      recipients: props.state.emailRecipients,
      subject: props.state.subject,
      actionUrl: props.state.links?.[0]?.url || "",
    };

    await api.pushMessage({
      data,
      sender: { email: "whatever" },
      transports: props.state.transportations as "email"[], // real pro typescripting
      type: props.state.messageType as "message" | "event",
    });

    revalidatePath("/");
  }

  async function goBack() {
    "use server";

    const next = Object.assign({}, props.state, {
      confirmedEmailRecipientsAt: "",
    });
    console.log(next);
    await api.upsertMessageState(next, props.userId, props.stateId);
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
                id="changed-name-0"
                name="changed-name"
                type="radio"
                value="yes"
                className="govie-radios__input"
                defaultChecked
              />
              <label
                className="govie-label--s govie-radios__label"
                htmlFor="changed-name-0"
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
                id="changed-name-0"
                name="changed-name"
                type="radio"
                value="yes"
                className="govie-radios__input"
                disabled
              />
              <label
                className="govie-label--s govie-radios__label"
                htmlFor="changed-name-0"
              >
                {t("sendLater")}
              </label>
            </div>
          </div>
        </div>
        <div className="govie-form-group" style={{ color: "gray" }}>
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
                    disabled
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
                    disabled
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
                    disabled
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
                    htmlFor="schedule-date-day"
                  >
                    {t("hour")}
                  </label>
                  <input
                    style={{ border: "2px solid gray" }}
                    className="govie-input govie-date-input__input govie-input--width-2"
                    id="schedule-date-day"
                    name="schedule-date-day"
                    type="text"
                    inputMode="numeric"
                    disabled
                  />
                </div>
              </div>
              <div className="govie-date-input__item">
                <div className="govie-form-group">
                  <label
                    className="govie-label--s govie-date-input__label"
                    htmlFor="schedule-date-day"
                  >
                    {t("minute")}
                  </label>
                  <input
                    style={{ border: "2px solid gray" }}
                    className="govie-input govie-date-input__input govie-input--width-2"
                    id="schedule-date-day"
                    name="schedule-date-day"
                    type="text"
                    inputMode="numeric"
                    disabled
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
