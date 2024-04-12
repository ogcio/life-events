import { api, apistub, utils } from "messages";
import { MessageCreateProps } from "../../../../utils/messaging";
import dayjs from "dayjs";
import { revalidatePath } from "next/cache";
import BackButton from "./BackButton";
import { getTranslations } from "next-intl/server";

export default async (props: MessageCreateProps) => {
  const t = await getTranslations("sendAMessage.EmailPreview");
  async function submit() {
    "use server";
    await api.upsertMessageState(
      Object.assign({}, props.state, {
        confirmedContentAt: dayjs().toISOString(),
      }),
      props.userId,
      props.stateId,
    );
    revalidatePath("/");
  }

  async function goBack() {
    "use server";

    const next = Object.assign({}, props.state, { confirmedContentAt: "" });
    await api.upsertMessageState(next, props.userId, props.stateId);
    revalidatePath("/");
  }

  const template = props.state.templateMetaId
    ? await apistub.templates.get(props.state.templateMetaId, "en")
    : undefined;

  const interpolations = props.state.templateInterpolations;

  const interpolationKeys = Object.keys(interpolations);

  const richText = template
    ? interpolationKeys.reduce(
        utils.interpolationReducer(interpolations),
        template.richText,
      )
    : props.state.richText;
  const plainText = template
    ? interpolationKeys.reduce(
        utils.interpolationReducer(interpolations),
        template.plainText,
      )
    : props.state.plainText;
  const subject = template
    ? interpolationKeys.reduce(
        utils.interpolationReducer(interpolations),
        template.subject,
      )
    : props.state.subject;

  const excerpt = template
    ? interpolationKeys.reduce(
        utils.interpolationReducer(interpolations),
        template.excerpt,
      )
    : props.state.excerpt;

  return (
    <>
      <form action={submit}>
        <div style={{ marginBottom: "30px" }}>
          <h1 className="govie-heading-l">{subject}</h1>
          <p className="govie-body">{excerpt}</p>
          <p className="govie-body">{richText}</p>
          <p className="govie-body">{plainText}</p>

          <a href={""} className="govie-link">
            {props.state.links.at(0) ?? ""}
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
