import dayjs from "dayjs";
import { ApiMessageState, MessageCreateProps } from "../../../utils/messaging";
import { api, temporaryMockUtils } from "messages";
import { revalidatePath } from "next/cache";
import BackButton from "./BackButton";
import { getTranslations } from "next-intl/server";

export default async (props: MessageCreateProps) => {
  const t = await getTranslations("sendAMessage.EmailForm");
  const tError = await getTranslations("formErrors");

  const errors = props.stateId
    ? await temporaryMockUtils.getErrors(props.userId, props.stateId)
    : [];

  async function submit(formData: FormData) {
    "use server";

    // Maybe components should require a state id
    if (!props.stateId) {
      return;
    }

    const subject = formData.get("subject")?.toString();
    const content = formData.get("message")?.toString();
    const link = formData.get("link")?.toString();

    const formErrors: Parameters<typeof temporaryMockUtils.createErrors>[0] =
      [];

    if (!subject) {
      formErrors.push({
        errorValue: "",
        field: "subject",
        messageKey: "empty",
      });
    }

    if (!content) {
      formErrors.push({
        errorValue: "",
        field: "message",
        messageKey: "empty",
      });
    }

    if (Boolean(formErrors.length)) {
      await temporaryMockUtils.createErrors(
        formErrors,
        props.userId,
        props.stateId,
      );
      return revalidatePath("/");
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

  const subjectError = errors.find((error) => error.field === "subject");
  const messageError = errors.find((error) => error.field === "message");

  return (
    <>
      <form action={submit}>
        <h1 className="govie-heading-l">{t("title")}</h1>
        <div
          className={
            subjectError
              ? "govie-form-group govie-form-group--error"
              : "govie-form-group"
          }
        >
          {subjectError && (
            <p id="input-field-error" className="govie-error-message">
              <span className="govie-visually-hidden">Error:</span>
              {tError(subjectError.messageKey, {
                field: tError(`fields.${subjectError.field}`),
                indArticleCheck: "",
              })}
            </p>
          )}
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

        <div
          className={
            messageError
              ? "govie-form-group govie-form-group--error"
              : "govie-form-group"
          }
        >
          <h1 className="govie-label-wrapper">
            <label htmlFor="message" className="govie-label--s govie-label--l">
              {t("message")}
            </label>
          </h1>
          {messageError && (
            <p id="input-field-error" className="govie-error-message">
              <span className="govie-visually-hidden">Error:</span>
              {tError(messageError.messageKey, {
                field: tError(`fields.${messageError.field}`),
                indArticleCheck: "",
              })}
            </p>
          )}
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
