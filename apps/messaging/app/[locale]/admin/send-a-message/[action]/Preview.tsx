import { api, utils } from "messages";
import { MessageCreateProps } from "../../../../utils/messaging";
import dayjs from "dayjs";
import { revalidatePath } from "next/cache";
import BackButton from "./BackButton";
import { getTranslations } from "next-intl/server";
import { Messaging } from "building-blocks-sdk";
import { PgSessions } from "auth/sessions";
import { headers } from "next/headers";

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

    const next = Object.assign({}, props.state, { submittedContentAt: "" });
    await api.upsertMessageState(next, props.userId, props.stateId);
    revalidatePath("/");
  }

  const { userId } = await PgSessions.get();
  const template = props.state.templateMetaId
    ? (
        await new Messaging(userId).getTemplate(props.state.templateMetaId)
      ).data?.contents.find(
        (c) => c.lang === (headers().get("x-next-intl-locale") ?? "en"),
      )
    : null;

  const interpolations = props.state.templateInterpolations;

  const interpolationKeys = Object.keys(interpolations);

  const richText = template?.data
    ? interpolationKeys.reduce(
        utils.interpolationReducer(interpolations),
        template.data.richText,
      )
    : props.state.richText;
  const plainText = template?.data
    ? interpolationKeys.reduce(
        utils.interpolationReducer(interpolations),
        template.data.plainText,
      )
    : props.state.plainText;
  const subject = template?.data
    ? interpolationKeys.reduce(
        utils.interpolationReducer(interpolations),
        template.data.subject,
      )
    : props.state.subject;

  const excerpt = template?.data
    ? interpolationKeys.reduce(
        utils.interpolationReducer(interpolations),
        template.data.excerpt,
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
