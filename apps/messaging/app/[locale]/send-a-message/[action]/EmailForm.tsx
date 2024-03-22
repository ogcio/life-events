import dayjs from "dayjs";
import { ApiMessageState, MessageCreateProps } from "../../../utils/messaging";
import { api } from "messages";
import { revalidatePath } from "next/cache";
import BackButton from "./BackButton";

export default (props: MessageCreateProps) => {
  async function submit(formData: FormData) {
    "use server";

    const subject = formData.get("subject")?.toString();
    const content = formData.get("message")?.toString();
    const link = formData.get("link")?.toString();

    if (!subject || !content || !link) {
      return;
    }

    const next: ApiMessageState = Object.assign({}, props.state, {
      links: [{ url: link, label: "" }],
      content,
      subject,
      submittedEmailAt: dayjs().toISOString(),
    });

    await api.upsertMessageState(next, props.userId, props.stateId);
    revalidatePath("/");
  }

  async function goBack() {
    "use server";

    const next = Object.assign({}, props.state, { submittedMetaAt: "" });
    await api.upsertMessageState(next, props.userId, props.stateId);
    revalidatePath("/");
  }

  return (
    <>
      <form action={submit}>
        <h1 className="govie-heading-l">Email</h1>
        <p>Lets have some templates here</p>
        <div className="govie-form-group">
          <label htmlFor="input-field" className="govie-label--s">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            className="govie-input"
            autoComplete="off"
            defaultValue={props.state.subject}
          />
        </div>

        <div className="govie-form-group">
          <h1 className="govie-label-wrapper">
            <label htmlFor="message" className="govie-label--s govie-label--l">
              Message
            </label>
          </h1>
          <textarea
            id="message"
            name="message"
            className="govie-textarea"
            rows={5}
            defaultValue={props.state.content}
          ></textarea>
        </div>

        <div className="govie-form-group">
          <label htmlFor="link" className="govie-label--s">
            Link
          </label>
          <input
            type="text"
            id="link"
            name="link"
            className="govie-input"
            defaultValue={props.state.links.at(0)?.url ?? ""}
          />
        </div>

        <button type="submit" className="govie-button">
          Preview
        </button>
      </form>
      <form action={goBack}>
        <BackButton>Back</BackButton>
      </form>
    </>
  );
};
