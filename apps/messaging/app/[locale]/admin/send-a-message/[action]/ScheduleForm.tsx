import { api, temporaryMockUtils, utils } from "messages";
import {
  isAvailableTransport,
  MessageCreateProps,
} from "../../../../utils/messaging";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(tz);

import { revalidatePath } from "next/cache";
import BackButton from "./BackButton";

import { DUBLIN_TIMEZONE } from "../../../../../types/shared";
import { getTranslations } from "next-intl/server";
import { AuthenticationFactory } from "../../../../utils/authentication-factory";

export default async (props: MessageCreateProps) => {
  const [t, tCommons] = await Promise.all([
    getTranslations("sendAMessage.ScheduleForm"),
    getTranslations("Commons"),
  ]);
  async function submit(formData: FormData) {
    "use server";

    if (!props.state.userIds.length) {
      await temporaryMockUtils.createErrors(
        [{ errorValue: "", field: "", messageKey: "" }],
        props.userId,
        "create_error",
      );

      return revalidatePath("/");
    }

    const schedule = formData.get("schedule")?.toString();
    const year = formData.get("schedule-date-year")?.toString();
    const month = formData.get("schedule-date-month")?.toString();
    const day = formData.get("schedule-date-day")?.toString();
    const hour = formData.get("schedule-date-hour")?.toString();
    const minute = formData.get("schedule-date-minute")?.toString();

    let scheduleAt = "";
    if (schedule === "future" && year && month && day && hour && minute) {
      scheduleAt = dayjs
        .tz(`${year}-${month}-${day} ${hour}:${minute}`, DUBLIN_TIMEZONE)
        .format();
    } else {
      scheduleAt = dayjs().format();
    }

    const messagesClient = await AuthenticationFactory.getMessagingClient();
    const { data: template, error } = await messagesClient.getTemplate(
      props.state.templateMetaId,
    );

    if (error || !template) {
      await temporaryMockUtils.createErrors(
        [{ errorValue: error?.name || "", field: "", messageKey: "" }],
        props.userId,
        "create_error",
      );

      return revalidatePath("/");
    }

    let successfulMessagesCreated = 0;

    for (const userId of props.state.userIds) {
      const { data: user, error } = await messagesClient.getUser(userId, false);

      if (error || !user) {
        // Needs redundancy strategy here
        continue;
      }

      let message: Awaited<ReturnType<typeof messagesClient.buildMessage>>;
      try {
        message = await messagesClient.buildMessage(
          template.contents.map((c) => ({
            ...c,
            threadName: c.subject,
            messageName: c.subject,
          })),
          user.lang || "",
          {
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            phone: user.phoneNumber || "",
            email: user.emailAddress || "",
            ppsn: user.ppsn || "",
          },
        );
      } catch (err) {
        // Needs redundancy strategy here
        continue;
      }

      try {
        const preferredTransports: ("sms" | "email" | "lifeEvent")[] = [];
        for (const transport of props.state.transportations) {
          if (isAvailableTransport(transport)) {
            preferredTransports.push(transport);
          }
        }

        const { error } = await messagesClient.send({
          bypassConsent: false,
          message,
          preferredTransports,
          scheduleAt,
          security: "",
          recipientUserId: user.userId,
        });
        if (Boolean(error)) {
          continue;
        }
      } catch (err) {
        // Needs redundancy strategy here
        continue;
      }
      successfulMessagesCreated += 1;
    }

    if (!successfulMessagesCreated) {
      await temporaryMockUtils.createErrors(
        [{ errorValue: "", field: "", messageKey: "" }],
        props.userId,
        "create_error",
      );

      return revalidatePath("/");
    }

    await api.upsertMessageState(
      Object.assign({}, props.state, {
        confirmedScheduleAt: dayjs().toISOString(),
        successfulMessagesCreated,
      }),
      props.userId,
      props.stateId,
    );

    return revalidatePath("/");
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

  const errors = await temporaryMockUtils.getErrors(
    props.userId,
    "create_error",
  );
  return (
    <div className="govie-grid-column-two-thirds-from-desktop">
      {Boolean(errors.length) && (
        <div className="govie-error-summary">
          <div>
            <h2>
              <span
                className="govie-error-summary__title"
                style={{ margin: "unset" }}
              >
                {t("serverError")}
              </span>
            </h2>
          </div>
        </div>
      )}
      <form action={submit}>
        <h1>
          <span style={{ margin: "unset" }} className="govie-heading-xl">
            {t("title")}
          </span>
        </h1>

        <h3 style={{ margin: "0 0 5px 0" }}>
          <span style={{ margin: "unset" }} className="govie-heading-m">
            {t("schedule")}
          </span>
        </h3>
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
        <BackButton>{tCommons("backLink")}</BackButton>
      </form>
    </div>
  );
};
