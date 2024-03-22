import { api } from "messages";
import { MessageCreateProps } from "../../../utils/messaging";
import dayjs from "dayjs";
import { revalidatePath } from "next/cache";
import BackButton from "./BackButton";

export default (props: MessageCreateProps) => {
  async function submit(formData: FormData) {
    "use server";

    await api.upsertMessageState(
      Object.assign({}, props.state, {
        confirmedEmailRecipientsAt: dayjs().toISOString(),
      }),
      props.userId,
      props.stateId,
    );
    revalidatePath("/");
  }

  async function goBack() {
    "use server";

    const next = Object.assign({}, props.state, { confirmedEmailAt: "" });
    await api.upsertMessageState(next, props.userId, props.stateId);
    revalidatePath("/");
  }

  async function recipientAction(formData: FormData) {
    "use server";

    const recipient = formData.get("recipient")?.toString();
    if (!recipient) return;

    const next = Object.assign({}, props.state, {
      emailRecipients: [...props.state.emailRecipients, recipient],
    });
    await api.upsertMessageState(next, props.userId, props.stateId);
    revalidatePath("/");
  }

  return (
    <>
      <form action={recipientAction}>
        <h1 className="govie-heading-l">Add Recipients</h1>

        <div className="govie-form-group">
          <label htmlFor="input-field" className="govie-label--s">
            Add recipient
          </label>
          <div className="govie-hint">Added recipients will be added below</div>
          <div className="govie-input__wrapper">
            <input
              type="text"
              id="recipient"
              name="recipient"
              className="govie-input"
              defaultValue=""
            />
            <button className="govie-input__suffix">Add</button>
          </div>
        </div>
        <ul className="govie-list">
          {props.state.emailRecipients.map((email) => (
            <li>{email}</li>
          ))}
        </ul>
      </form>
      <form action={submit}>
        <button
          disabled={!Boolean(props.state.emailRecipients.length)}
          className="govie-button"
        >
          Continue to schedule
        </button>
      </form>
      <form action={goBack}>
        <BackButton>Back to message</BackButton>
      </form>
    </>
  );
};
