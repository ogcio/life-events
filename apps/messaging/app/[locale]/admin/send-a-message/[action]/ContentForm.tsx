import dayjs from "dayjs";
import {
  ApiMessageState,
  MessageCreateProps,
} from "../../../../utils/messaging";
import { api, temporaryMockUtils } from "messages";
import { revalidatePath } from "next/cache";
import BackButton from "./BackButton";
import { getTranslations } from "next-intl/server";

export default async (props: MessageCreateProps) => {
  const [t, tError] = await Promise.all([
    getTranslations("sendAMessage.EmailForm"),
    getTranslations("formErrors"),
  ]);

  type PaymentRequest = {
    requestId: string;
    userId: string;
    title: string;
    redirectUrl: string;
  };

  const getPaymentRequests = async (): Promise<PaymentRequest[]> => {
    try {
      const requestURL = new URL("api/requests", process.env.PAYMENTS_URL);
      const paymentRequestRespone = await fetch(requestURL.href);
      const parsed = (await paymentRequestRespone.json()) as PaymentRequest[];

      return parsed;
    } catch (err) {
      console.log(err);
    }

    return [];
  };

  const paymentRequests = await getPaymentRequests();

  const errors = props.stateId
    ? await temporaryMockUtils.getErrors(props.userId, props.stateId)
    : [];

  async function submit(formData: FormData) {
    "use server";

    // Maybe components should require a state id
    if (!props.stateId) {
      return;
    }

    type FormProperties = {
      link: string | undefined;
      paymentRequestId: string;
      subject: string | undefined;
      richText: string | undefined;
      plainText: string | undefined;
      excerpt: string | undefined;
    };

    const extractFormProperties = (formData: FormData): FormProperties => ({
      paymentRequestId: formData.get("paymentRequestId")?.toString() || "",
      subject: formData.get("subject")?.toString(),
      richText: formData.get("richText")?.toString(),
      plainText: formData.get("plainText")?.toString(),
      excerpt: formData.get("excerpt")?.toString(),
      link: formData.get("link")?.toString(),
    });

    const formProperties = extractFormProperties(formData);

    const formErrors: Parameters<typeof temporaryMockUtils.createErrors>[0] =
      [];

    const required = {
      subject: formProperties.subject,
      plainText: formProperties.plainText,
      excerpt: formProperties.excerpt,
    };

    for (const key of Object.keys(required)) {
      if (!required[key]) {
        formErrors.push({
          errorValue: "",
          field: key,
          messageKey: "empty",
        });
      }
    }

    if (Boolean(formErrors.length)) {
      await temporaryMockUtils.createErrors(
        formErrors,
        props.userId,
        props.stateId,
      );
      return revalidatePath("/");
    }

    const links = formProperties.link ? [formProperties.link] : [];
    const next: ApiMessageState = Object.assign({}, props.state, {
      links,
      ...required,
      richText: formProperties.richText,
      submittedContentAt: dayjs().toISOString(),
      paymentRequestId: formProperties.paymentRequestId,
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
  const excerptError = errors.find((error) => error.field === "excerpt");
  const plainTextError = errors.find((error) => error.field === "plainText");
  const richTextError = errors.find((error) => error.field === "richText");

  return (
    <>
      <form action={submit}>
        <h1 className="govie-heading-l">{t("title")}</h1>

        {/* Subject */}
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

        {/* Excerpt */}
        <div
          className={
            excerptError
              ? "govie-form-group govie-form-group--error"
              : "govie-form-group"
          }
        >
          <h3>
            <label htmlFor="excerpt" className="govie-label--s govie-label--l">
              {t("excerptLabel")}
            </label>
          </h3>
          <textarea
            id="excerpt"
            name="excerpt"
            className="govie-textarea"
            rows={5}
            defaultValue={props.state.excerpt}
          ></textarea>
        </div>

        {/* Rich text (html) */}
        <div
          className={
            richTextError
              ? "govie-form-group govie-form-group--error"
              : "govie-form-group"
          }
        >
          <h1 className="govie-label-wrapper">
            <label htmlFor="richText" className="govie-label--s govie-label--l">
              {t("richTextLabel")}
            </label>
          </h1>
          {richTextError && (
            <p id="input-field-error" className="govie-error-message">
              <span className="govie-visually-hidden">Error:</span>
              {tError(richTextError.messageKey, {
                field: tError(`fields.${richTextError.field}`),
                indArticleCheck: "",
              })}
            </p>
          )}
          <textarea
            id="richText"
            name="richText"
            className="govie-textarea"
            rows={15}
            defaultValue={props.state.richText}
          ></textarea>
        </div>

        {/* Plain text */}
        <div
          className={
            plainTextError
              ? "govie-form-group govie-form-group--error"
              : "govie-form-group"
          }
        >
          <h1 className="govie-label-wrapper">
            <label
              htmlFor="plainText"
              className="govie-label--s govie-label--l"
            >
              {t("plainTextLabel")}
            </label>
          </h1>
          {plainTextError && (
            <p id="input-field-error" className="govie-error-message">
              <span className="govie-visually-hidden">Error:</span>
              {tError(plainTextError.messageKey, {
                field: tError(`fields.${plainTextError.field}`),
                indArticleCheck: "",
              })}
            </p>
          )}
          <textarea
            id="plainText"
            name="plainText"
            className="govie-textarea"
            rows={15}
            defaultValue={props.state.plainText}
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
            defaultValue={props.state.links.at(0) ?? ""}
          />
        </div>

        {Boolean(paymentRequests.length) ? (
          <div className="govie-form-group">
            <h3>
              <span className="govie-heading-s">{t("addPaymentTitle")}</span>
            </h3>
            <select className="govie-select" name="paymentRequestId">
              <option value="">{t("emptyPaymentOption")}</option>
              {paymentRequests.map((req) => (
                <option value={req.requestId}>{req.title}</option>
              ))}
            </select>
          </div>
        ) : null}

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
