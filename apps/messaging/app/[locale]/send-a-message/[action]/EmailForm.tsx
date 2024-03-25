import dayjs from "dayjs";
import { ApiMessageState, MessageCreateProps } from "../../../utils/messaging";
import { api } from "messages";
import { revalidatePath } from "next/cache";
import BackButton from "./BackButton";
import { useTranslations } from "next-intl";

export default (props: MessageCreateProps) => {
  const t = useTranslations("sendAMessage.EmailForm");
  async function submit(formData: FormData) {
    "use server";

    const subject = formData.get("subject")?.toString();
    const content = formData.get("message")?.toString();
    const link = formData.get("link")?.toString();

    if (!subject || !content) {
      return;
    }

    const links = link ? [{ url: link, label: "" }] : [];
    const next: ApiMessageState = Object.assign({}, props.state, {
      links,
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
        <h1 className="govie-heading-l">{t("title")}</h1>
        <div className="govie-form-group">
          <label htmlFor="input-field" className="govie-label--s">
            {t("subject")}
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
              {t("message")}
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
            {t("link")}
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
          {t("submitText")}
        </button>
      </form>
      <form action={goBack}>
        <BackButton>{t("backLink")}</BackButton>
      </form>
    </>
  );
};
