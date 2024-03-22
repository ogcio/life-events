import { api } from "messages";
import { MessageCreateProps } from "../../../utils/messaging";
import dayjs from "dayjs";
import { revalidatePath } from "next/cache";
import BackButton from "./BackButton";

export default (props: MessageCreateProps) => {
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
      transports: props.state.transportation as "email"[], // real pro typescripting
      type: props.state.messageType as "message" | "event",
    });

    revalidatePath("/");
  }

  async function goBack() {
    "use server";

    const next = Object.assign({}, props.state, {
      confirmedEmailRecipientsAt: "",
    });
    await api.upsertMessageState(next, props.userId, props.stateId);
    revalidatePath("/");
  }

  return (
    <>
      <form action={submit}>
        <h1 className="govie-heading-l">Schedule message</h1>
        <p>Only immediately is actually available..</p>

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
                Send now
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
                Send later
              </label>
            </div>
          </div>
        </div>

        <button type="submit" className="govie-button">
          Send message
        </button>
      </form>
      <form action={goBack}>
        <BackButton>Back to recipients</BackButton>
      </form>
    </>
  );
};
