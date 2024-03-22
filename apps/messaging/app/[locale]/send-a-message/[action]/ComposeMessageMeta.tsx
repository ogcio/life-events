import dayjs from "dayjs";
import { api } from "messages";
import { revalidatePath } from "next/cache";
import { MessageCreateProps } from "../../../utils/messaging";

export default (props: MessageCreateProps) => {
  async function submit(formData: FormData) {
    "use server";

    const transportation: string[] = [];
    if (Boolean(formData.get("email"))) {
      transportation.push("email");
    }

    const messageType = formData.get("messageType")?.toString();
    console.log(messageType);
    if (!messageType) {
      return;
    }

    await api.upsertMessageState(
      Object.assign({}, props.state, {
        submittedMetaAt: dayjs().toISOString(),
        transportation,
        messageType,
      }),
      props.userId,
      props.stateId,
    );

    revalidatePath("/");
  }

  return (
    <form action={submit}>
      <h1 className="govie-heading-l">Send a message</h1>
      <hr />

      {/* Select transportation checkboxes */}
      <div className="govie-form-group">
        <h3 className="govie-heading-s">Choose transportation</h3>
        <div className="govie-hint govie-!-font-size-16">
          All messages will securely persist in the messaging system regardless
          of additional transportations. (DO WE WANT A DISCLAIMER LIKE THIS?)
        </div>
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
                defaultChecked={props.state.transportation.some(
                  (t) => t === "email",
                )}
              />
              <label
                className="govie-label--s govie-checkboxes__label"
                htmlFor="email"
              >
                Email
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
                SMS
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
                Postal service
              </label>
            </div>
          </div>
        </fieldset>
      </div>

      <hr />

      <div className="govie-form-group ">
        <h3 className="govie-heading-s">Choose message type</h3>

        <div className="govie-radios govie-radios--small ">
          <div className="govie-radios__item">
            <input
              id="messageType"
              name="messageType"
              type="radio"
              value="message"
              className="govie-radios__input"
              defaultChecked
            />
            <label
              className="govie-label--s govie-radios__label"
              htmlFor="messageType"
            >
              Message
            </label>
          </div>
          <div className="govie-radios__item">
            <input
              id="messageType"
              name="messageType"
              type="radio"
              value="event"
              className="govie-radios__input"
            />
            <label
              className="govie-label--s govie-radios__label"
              htmlFor="messageType"
            >
              Event
            </label>
          </div>
        </div>
      </div>

      <button className="govie-button" type="submit">
        Continue
      </button>
    </form>
  );
};
