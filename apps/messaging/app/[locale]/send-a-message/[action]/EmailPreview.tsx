import { api } from "messages";
import { MessageCreateProps } from "../../../utils/messaging";
import dayjs from "dayjs";
import { revalidatePath } from "next/cache";
import BackButton from "./BackButton";
import { useTranslations } from "next-intl";

export default (props: MessageCreateProps) => {
  const t = useTranslations("sendAMessage.EmailPreview");
  async function submit() {
    "use server";
    await api.upsertMessageState(
      Object.assign({}, props.state, {
        confirmedEmailAt: dayjs().toISOString(),
      }),
      props.userId,
      props.stateId,
    );
    revalidatePath("/");
  }

  async function goBack() {
    "use server";

    const next = Object.assign({}, props.state, { submittedEmailAt: "" });
    await api.upsertMessageState(next, props.userId, props.stateId);
    revalidatePath("/");
  }

  return (
    <>
      <form action={submit}>
        <div style={{ marginBottom: "30px" }}>
          <h1 className="govie-heading-l">{props.state.subject}</h1>
          <p className="govie-body">{props.state.content}</p>
          <a href={""} className="govie-link">
            {props.state.links.at(0)?.url ?? ""}
          </a>
        </div>
        <button className="govie-button">{t("submitText")}</button>
      </form>
      <form action={goBack}>
        <BackButton>{t("backLink")}</BackButton>
      </form>
    </>
  );
};
