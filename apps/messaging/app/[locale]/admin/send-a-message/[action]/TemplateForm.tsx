import { revalidatePath } from "next/cache";
import { MessageCreateProps } from "../../../../utils/messaging";
import { api } from "messages";
import BackButton from "./BackButton";
import { getTranslations } from "next-intl/server";

import { headers } from "next/headers";
import { AuthenticationFactory } from "../../../../utils/authentication-factory";

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
      "submittedContentAt"
    > = {
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

  const templateResult = (
    await (
      await AuthenticationFactory.getMessagingClient()
    ).getTemplate(props.state.templateMetaId)
  )?.data;

  const template =
    templateResult?.contents.find(
      (x) => x.language === headers().get("x-next-intl-locale"),
    ) || templateResult?.contents.at(0);

  return (
    <div className="govie-grid-column-two-thirds-from-desktop">
      <h1>
        <span style={{ margin: "unset" }} className="govie-heading-xl">
          {t("title", { name: template?.templateName })}
        </span>
      </h1>
      <label className="govie-label--s">{t("subjectLabel")}</label>
      <p className="govie-body">{template?.subject}</p>

      <label className="govie-label--s">{t("excerptLabel")}</label>
      <p className="govie-body">{template?.excerpt}</p>

      <label className="govie-label--s">{t("plainTextLabel")}</label>
      <p className="govie-body">{template?.plainText}</p>

      <form action={action}>
        <button className="govie-button" type="submit">
          {t("continueButtonText")}
        </button>
      </form>

      <form action={goBack}>
        <BackButton>{t("back")}</BackButton>
      </form>
    </div>
  );
};
