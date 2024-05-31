import dayjs from "dayjs";
import {
  ApiMessageState,
  MessageCreateProps,
} from "../../../../utils/messaging";
import { api, temporaryMockUtils } from "messages";
import { revalidatePath } from "next/cache";
import BackButton from "./BackButton";
import { getTranslations } from "next-intl/server";

type FormProperties = {
  link: string | undefined;
  paymentRequestId: string;
  subject: string | undefined;
  richText: string | undefined;
  plainText: string | undefined;
  excerpt: string | undefined;
};

type PaymentRequest = {
  requestId: string;
  userId: string;
  title: string;
  redirectUrl: string;
};

type FormError = {
  field: string;
  messageKey: string;
  errorValue: string;
};

const extractFormProperties = (formData: FormData): FormProperties => ({
  paymentRequestId: formData.get("paymentRequestId")?.toString() || "",
  subject: formData.get("subject")?.toString(),
  richText: formData.get("richText")?.toString(),
  plainText: formData.get("plainText")?.toString(),
  excerpt: formData.get("excerpt")?.toString(),
  link: formData.get("link")?.toString(),
});

const extractFormErrors = (
  formProperties: FormProperties,
): Parameters<typeof temporaryMockUtils.createErrors>[0] => {
  const formErrors: Parameters<typeof temporaryMockUtils.createErrors>[0] = [];
  const required = ["subject", "plainText", "excerpt"];
  for (const key of required) {
    if (!formProperties[key]) {
      formErrors.push({
        errorValue: "",
        field: key,
        messageKey: "empty",
      });
    }
  }

  return formErrors;
};

const prepareSubmit = async (params: {
  props: MessageCreateProps;
  formData: FormData;
}) => {
  const { props, formData } = params;
  // Maybe components should require a state id
  if (!props.stateId) {
    return;
  }

  const formProperties = extractFormProperties(formData);
  const formErrors = extractFormErrors(formProperties);

  if (Boolean(formErrors.length)) {
    await temporaryMockUtils.createErrors(
      formErrors,
      props.userId,
      props.stateId,
    );
    return revalidatePath("/");
  }

  const next: ApiMessageState = Object.assign({}, props.state, {
    ...formProperties,
    submittedContentAt: dayjs().toISOString(),
  });

  await api.upsertMessageState(next, props.userId, props.stateId);

  revalidatePath("/");
};

const prepareGoBack = async (params: { props: MessageCreateProps }) => {
  const next = Object.assign({}, params.props.state, { submittedMetaAt: "" });
  await api.upsertMessageState(next, params.props.userId, params.props.stateId);
  revalidatePath("/");
};

const loadErrors = async (params: {
  props: MessageCreateProps;
}): Promise<Record<string, FormError>> => {
  if (!params.props.stateId) {
    return {};
  }
  const errors = await temporaryMockUtils.getErrors(
    params.props.userId,
    params.props.stateId,
  );
  const outputErrors: Record<string, FormError> = {};
  for (const error of errors) {
    outputErrors[error.field] = error;
  }

  return outputErrors;
};

export default async (props: MessageCreateProps) => {
  const [t, tError] = await Promise.all([
    getTranslations("sendAMessage.EmailForm"),
    getTranslations("formErrors"),
  ]);

  const errors = await loadErrors({ props });

  const submit = async (formData: FormData) => {
    "use server";

    return prepareSubmit({ formData, props });
  };

  const goBack = async () => {
    "use server";

    return prepareGoBack({ props });
  };

  return (
    <>
      <form action={submit}>
        <h1>
          <span style={{ margin: "unset" }} className="govie-heading-xl">
            {t("title")}
          </span>
        </h1>

        {/* Subject */}
        <div
          className={
            errors["subject"]
              ? "govie-form-group govie-form-group--error"
              : "govie-form-group"
          }
        >
          {errors["subject"] && (
            <p id="input-field-error" className="govie-error-message">
              <span className="govie-visually-hidden">Error:</span>
              {tError(errors["subject"].messageKey, {
                field: tError(`fields.${errors["subject"].field}`),
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
            errors["excerpt"]
              ? "govie-form-group govie-form-group--error"
              : "govie-form-group"
          }
        >
          {errors["excerpt"] && (
            <p id="input-field-error" className="govie-error-message">
              <span className="govie-visually-hidden">Error:</span>
              {tError(errors["excerpt"].messageKey, {
                field: tError(`fields.${errors["excerpt"].field}`),
                indArticleCheck: "",
              })}
            </p>
          )}

          <label htmlFor="excerpt" className="govie-label--s govie-label--l">
            {t("excerptLabel")}
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            className="govie-textarea"
            rows={5}
            defaultValue={props.state.excerpt}
          ></textarea>
        </div>

        {/* Rich text (html) */}
        {/* <div
          className={
            errors["richText"]
              ? "govie-form-group govie-form-group--error"
              : "govie-form-group"
          }
        >
          <h1 className="govie-label-wrapper">
            <label htmlFor="richText" className="govie-label--s govie-label--l">
              {t("richTextLabel")}
            </label>
          </h1>
          {errors["richText"] && (
            <p id="input-field-error" className="govie-error-message">
              <span className="govie-visually-hidden">Error:</span>
              {tError(errors["richText"].messageKey, {
                field: tError(`fields.${errors["richText"].field}`),
                indArticleCheck: "",
              })}
            </p>
          )}
          <textarea
            id="richText"
            name="richText"
            className="govie-textarea"
            rows={10}
            defaultValue={props.state.richText}
          ></textarea>
        </div> */}

        {/* Plain text */}
        <div
          className={
            errors["plainText"]
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
          {errors["plainText"] && (
            <p id="input-field-error" className="govie-error-message">
              <span className="govie-visually-hidden">Error:</span>
              {tError(errors["plainText"].messageKey, {
                field: tError(`fields.${errors["plainText"].field}`),
                indArticleCheck: "",
              })}
            </p>
          )}
          <textarea
            id="plainText"
            name="plainText"
            className="govie-textarea"
            rows={10}
            defaultValue={props.state.plainText}
          ></textarea>
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
