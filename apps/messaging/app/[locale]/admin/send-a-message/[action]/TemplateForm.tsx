import { revalidatePath } from "next/cache";
import { MessageCreateProps } from "../../../../utils/messaging";
import { api } from "messages";
import BackButton from "./BackButton";
import { getTranslations } from "next-intl/server";
import { PgSessions } from "auth/sessions";
import { Messaging } from "building-blocks-sdk";
import { headers } from "next/headers";

export default async (props: MessageCreateProps) => {
  const t = await getTranslations("sendAMessage.TemplateForm");
  async function action(formData: FormData) {
    "use server";

    const values: { value: string; key: string }[] = [];

    formData.forEach((value, key, p) => {
      if (!key.startsWith("$ACTION")) {
        values.push({ value: value.toString(), key });
      }
    });

    const update: Pick<
      Parameters<typeof api.upsertMessageState>[0],
      "templateInterpolations" | "submittedContentAt"
    > = {
      templateInterpolations: values.reduce<Record<string, string>>(
        (acc, pair) => {
          acc[pair.key] = pair.value;
          return acc;
        },
        {},
      ),
      submittedContentAt: new Date().toISOString(),
    };
    const next = Object.assign({}, props.state, update);
    await api.upsertMessageState(next, props.userId, props.stateId);
    revalidatePath("/");
  }

  async function goBack() {
    "use server";

    const next = Object.assign({}, props.state, {
      templateMetaId: "",
      submittedMetaAt: "",
    });
    await api.upsertMessageState(next, props.userId, props.stateId);
    revalidatePath("/");
  }

  const { userId } = await PgSessions.get();
  const templateResult = (
    await new Messaging(userId).getTemplate(props.state.templateMetaId)
  ).data;

  const template = templateResult?.contents.find(
    (x) => x.lang === headers().get("x-next-intl-locale") ?? "en",
  );

  return (
    <>
      <h1>
        <span className="govie-heading-l">
          {t("title", { name: template?.templateName })}
        </span>
      </h1>
      <label className="govie-label--s">{t("subjectLabel")}</label>
      <p className="govie-body">{template?.subject}</p>

      <label className="govie-label--s">{t("excerptLabel")}</label>
      <p className="govie-body">{template?.excerpt}</p>

      <label className="govie-label--s">{t("richTextLabel")}</label>
      <p className="govie-body">{template?.richText}</p>

      <label className="govie-label--s">{t("plainTextLabel")}</label>
      <p className="govie-body">{template?.plainText}</p>

      <hr />

      <h3>
        <span className="govie-heading-s">{t("variablesLabel")}</span>
      </h3>
      <form action={action}>
        {templateResult?.fields?.map((field) => (
          <div
            key={field.fieldName}
            className={
              !Boolean(false)
                ? "govie-form-group"
                : "govie-form-group govie-form-group--error"
            }
          >
            <label htmlFor="host" className="govie-label--s">
              {field.fieldName}
            </label>
            <div className="govie-hint" id="input-field-hint">
              {field.fieldType}
            </div>
            <input type="text" name={field.fieldName} className="govie-input" />
          </div>
        ))}

        <button className="govie-button" type="submit">
          {t("continueButtonText")}
        </button>
      </form>

      <form action={goBack}>
        <BackButton>{t("back")}</BackButton>
      </form>
    </>
  );
};
