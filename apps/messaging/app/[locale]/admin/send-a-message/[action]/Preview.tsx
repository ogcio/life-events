import { api, utils } from "messages";
import { MessageCreateProps } from "../../../../utils/messaging";
import dayjs from "dayjs";
import { revalidatePath } from "next/cache";
import BackButton from "./BackButton";
import { getTranslations } from "next-intl/server";
import { Messaging } from "building-blocks-sdk";
import { headers } from "next/headers";
import { AuthenticationFactory } from "../../../../utils/authentication-factory";

export default async (props: MessageCreateProps) => {
  const [t, tCommons] = await Promise.all([
    getTranslations("sendAMessage.EmailPreview"),
    getTranslations("Commons"),
  ]);
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

  const accessToken =
    await AuthenticationFactory.getInstance().getAccessToken();
  const template = props.state.templateMetaId
    ? (
        await new Messaging(accessToken).getTemplate(props.state.templateMetaId)
      ).data?.contents.find(
        (c) => c.lang === (headers().get("x-next-intl-locale") ?? "en"),
      )
    : null;

  const interpolations = props.state.templateInterpolations;

  const interpolationKeys = Object.keys(interpolations);

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
    <div className="govie-grid-column-two-thirds-from-desktop">
      <form action={submit}>
        <div style={{ marginBottom: "30px" }}>
          <h1>
            <span style={{ margin: "unset" }} className="govie-heading-xl">
              {t("title")}
            </span>
          </h1>
          <div
            style={{ margin: "unset" }}
            className="govie-body govie-!-font-weight-bold"
          >
            {t("subject")}
          </div>
          <p className="govie-body">{subject}</p>

          <div
            style={{ margin: "unset" }}
            className="govie-body govie-!-font-weight-bold"
          >
            {t("excerpt")}
          </div>
          <p className="govie-body">{excerpt}</p>

          {/* <div
            style={{ margin: "unset" }}
            className="govie-body govie-!-font-weight-bold"
          >
            {t("richText")}
          </div>
          <p className="govie-body">{richText}</p> */}

          <div
            style={{ margin: "unset" }}
            className="govie-body govie-!-font-weight-bold"
          >
            {t("plainText")}
          </div>
          <p className="govie-body">{plainText}</p>
        </div>
        <button className="govie-button">{t("submitText")}</button>
      </form>
      <form action={goBack}>
        <BackButton>{tCommons("backLink")}</BackButton>
      </form>
    </div>
  );
};
