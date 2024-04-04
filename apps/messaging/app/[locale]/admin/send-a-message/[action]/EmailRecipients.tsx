import { api } from "messages";
import { MessageCreateProps } from "../../../../utils/messaging";
import dayjs from "dayjs";
import { revalidatePath } from "next/cache";
import BackButton from "./BackButton";
import { useTranslations } from "next-intl";

export default (props: MessageCreateProps) => {
  const t = useTranslations("sendAMessage.EmailRecipients");
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
        <h1 className="govie-heading-l">{t("title")}</h1>

        <div className="govie-form-group">
          <h3 className="govie-label--s">{t("addRecipient")}</h3>
          <div className="govie-hint">{t("addRecipientHint")}</div>
          <div className="govie-input__wrapper">
            <input
              type="text"
              id="recipient"
              name="recipient"
              className="govie-input"
              defaultValue=""
            />
            <button className="govie-input__suffix">{t("add")}</button>
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
          {t("submitText")}
        </button>
      </form>
      <form action={goBack}>
        <BackButton>{t("backLink")}</BackButton>
      </form>
    </>
  );
};
