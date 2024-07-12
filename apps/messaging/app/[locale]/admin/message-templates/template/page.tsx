import { pgpool } from "messages/dbConnection";
import { LANG_EN, LANG_GA } from "../../../../../types/shared";
import { revalidatePath } from "next/cache";
import React from "react";
import { temporaryMockUtils } from "messages";
import { getTranslations } from "next-intl/server";
import { Messaging } from "building-blocks-sdk";
import { redirect } from "next/navigation";
import FlexMenuWrapper from "../../PageWithMenuFlexWrapper";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  avaliableMessagingTemplateStaticVariables,
  getInterpolationValues,
} from "../../../../utils/messaging";
import { AuthenticationFactory } from "../../../../utils/authentication-factory";

type FormContent = {
  templateName: string;
  subject: string;
  excerpt: string;
  plainText: string;
};

const LanguageForm = (props: {
  userId: string;
  state?: State;
  templateId?: string;
}) => {
  const t = useTranslations("MessageTemplate");
  async function submitLanguageChoice(formData: FormData) {
    "use server";

    const en = Boolean(formData.get("en")?.toString());
    const ga = Boolean(formData.get("ga")?.toString());

    const langs: string[] = [];
    en && langs.push(LANG_EN);
    ga && langs.push(LANG_GA);

    await pgpool.query(
      `
        insert into message_template_states(user_id, state)
        values($1, $2)
        on conflict(user_id) do
        update set state = message_template_states.state || $2
        where message_template_states.user_id = $1
    `,
      [props.userId, { langs }],
    );

    revalidatePath("/");
  }

  return (
    <form action={submitLanguageChoice}>
      <div className="govie-form-group">
        <h3 style={{ margin: "unset" }}>
          <span className="govie-heading-s">{t("selectLanguagesHeading")}</span>
        </h3>

        <fieldset className="govie-fieldset">
          <div
            className="govie-checkboxes govie-checkboxes--small"
            data-module="govie-checkboxes"
          >
            <div className="govie-checkboxes__item">
              <input
                className="govie-checkboxes__input"
                id="en"
                name="en"
                type="checkbox"
                defaultChecked={props.state?.langs?.some(
                  (lang) => lang === LANG_EN,
                )}
              />
              <label
                className="govie-label--s govie-checkboxes__label"
                htmlFor="en"
              >
                {t("en")}
              </label>
            </div>
            <div className="govie-checkboxes__item">
              <input
                className="govie-checkboxes__input"
                id="ga"
                name="ga"
                type="checkbox"
                defaultChecked={props.state?.langs?.some(
                  (lang) => lang === LANG_GA,
                )}
              />
              <label
                className="govie-label--s govie-checkboxes__label"
                htmlFor="ga"
              >
                {t("ga")}
              </label>
            </div>
          </div>
        </fieldset>
      </div>
      <button className="govie-button">
        {props.state?.langs.length ? t("updateLangButton") : t("setLangButton")}
      </button>
    </form>
  );
};

const ContentForm = async (props: {
  userId: string;
  contents?: State;
  templateId?: string;
}) => {
  const t = await getTranslations("MessageTemplate");
  const tError = await getTranslations("formErrors");

  async function submitTemplateContents(formData: FormData) {
    "use server";

    const langContents: State = { langs: props.contents?.langs || [] };
    const errors: Parameters<typeof temporaryMockUtils.createErrors>[0] = [];

    for (const lang of props.contents?.langs || []) {
      const templateName = formData.get(`${lang}_templateName`)?.toString();
      const excerpt = formData.get(`${lang}_excerpt`)?.toString();
      const plainText = formData.get(`${lang}_plainText`)?.toString();
      const subject = formData.get(`${lang}_subject`)?.toString();

      const required = { templateName, excerpt, plainText, subject };
      for (const key of Object.keys(required)) {
        if (!required[key]) {
          errors.push({
            field: `${lang}_${key}`,
            errorValue: "",
            messageKey: "empty",
          });
        }

        const variables = getInterpolationValues(required[key]);
        let hasIllegalVariables = false;
        for (const variable of variables) {
          if (!avaliableMessagingTemplateStaticVariables.has(variable)) {
            hasIllegalVariables = true;
            break;
          }
        }

        if (hasIllegalVariables) {
          errors.push({
            field: `${lang}_${key}`,
            errorValue: "",
            messageKey: "illegalVariable",
          });
        }
      }

      langContents[lang] = {
        templateName: templateName || "",
        excerpt: excerpt || "",
        plainText: plainText || "",
        subject: subject || "",
      };
    }

    if (errors.length) {
      await temporaryMockUtils.createErrors(errors, props.userId, "templates");
      await pgpool.query(
        `
        insert into message_template_states(user_id, state)
        values($1, $2)
        on conflict(user_id) do
        update set state = $2
        where message_template_states.user_id = $1
      `,
        [props.userId, langContents],
      );
      return revalidatePath("/");
    }
    const accessToken =
      await AuthenticationFactory.getInstance().getAccessToken();
    const sdkClient = new Messaging(accessToken);
    const contents: Parameters<typeof sdkClient.createTemplate>[0]["contents"] =
      [];

    for (const key of langContents.langs) {
      contents.push({
        lang: key,
        excerpt: langContents[key].excerpt,
        plainText: langContents[key].plainText,
        richText: langContents[key].plainText,
        subject: langContents[key].subject,
        templateName: langContents[key].templateName,
      });
    }

    const templateId = props.templateId;
    if (templateId) {
      const { error } = await sdkClient.updateTemplate(templateId, {
        contents: contents.map((content) => ({
          ...content,
          id: templateId,
        })),
        variables: [],
      });

      if (error) {
        await temporaryMockUtils.createErrors(
          [
            {
              errorValue: error.message || "update_error",
              field: "update_error",
              messageKey: "update_error",
            },
          ],
          props.userId,
          "update_error",
        );

        return revalidatePath("/");
      }
    } else {
      const { error } = await sdkClient.createTemplate({
        contents,
        variables: [],
      });

      if (error) {
        await temporaryMockUtils.createErrors(
          [
            {
              errorValue: error.message || "create_error",
              field: "create_error",
              messageKey: "create_error",
            },
          ],
          props.userId,
          "create_error",
        );

        return revalidatePath("/");
      }
    }

    return redirect("./");
  }

  const errors = (
    await temporaryMockUtils.getErrors(props.userId, "templates")
  ).reduce((acc, current) => {
    acc[current.field] = current;
    return acc;
  }, {});

  const headerMap = { [LANG_EN]: "English", [LANG_GA]: "Gaelige" };

  return (
    <form action={submitTemplateContents}>
      <span className="govie-caption-m">{t("interpolateHint")}</span>
      <h3 style={{ margin: "unset" }}>
        <span className="govie-heading-m">{t("allowedVariablesHeading")}</span>
      </h3>

      <ul className="govie-list">
        <li>{`{{firstName}}`}</li>
        <li>{`{{lastName}}`}</li>
        <li>{`{{ppsn}}`}</li>
        <li>{`{{email}}`}</li>
        <li>{`{{phone}}`}</li>
      </ul>
      {props.contents?.langs.map((lang) => (
        <React.Fragment key={lang}>
          <h2>
            <span className="govie-heading-l" style={{ margin: "unset" }}>
              {headerMap[lang]}
            </span>
          </h2>
          <div
            className={
              errors[`${lang}_templateName`]
                ? "govie-form-group govie-form-group--error"
                : "govie-form-group"
            }
          >
            <label htmlFor="templateName" className="govie-label--s">
              {t("templateNameLabel")}
            </label>
            <div className="govie-hint" id="input-field-hint">
              {t("templateNameHint")}
            </div>
            {errors[`${lang}_templateName`] && (
              <p id="input-field-error" className="govie-error-message">
                <span className="govie-visually-hidden">Error:</span>
                {tError(errors[`${lang}_templateName`].messageKey, {
                  field: tError(
                    `fields.${errors[`${lang}_templateName`].field}`,
                  ),
                  indArticleCheck: "",
                })}
              </p>
            )}
            <input
              type="text"
              id={`${lang}_templateName`}
              name={`${lang}_templateName`}
              className="govie-input"
              autoComplete="off"
              defaultValue={props.contents?.[lang]?.templateName}
            />
          </div>

          <div
            className={
              errors[`${lang}_subject`]
                ? "govie-form-group govie-form-group--error"
                : "govie-form-group"
            }
          >
            <label htmlFor="subject" className="govie-label--s">
              {t("subjectLabel")}
            </label>
            {errors[`${lang}_subject`] && (
              <p id="input-field-error" className="govie-error-message">
                <span className="govie-visually-hidden">Error:</span>
                {tError(errors[`${lang}_subject`].messageKey, {
                  field: tError(`fields.${errors[`${lang}_subject`].field}`),
                  indArticleCheck: "",
                })}
              </p>
            )}
            <input
              type="text"
              id={`${lang}_subject`}
              name={`${lang}_subject`}
              className="govie-input"
              autoComplete="off"
              defaultValue={props.contents?.[lang]?.subject}
            />
          </div>

          <div
            className={
              errors[`${lang}_excerpt`]
                ? "govie-form-group govie-form-group--error"
                : "govie-form-group"
            }
          >
            <h1 className="govie-label-wrapper">
              <label
                htmlFor="excerpt"
                className="govie-label--s govie-label--l"
              >
                {t("excerptLabel")}
              </label>
            </h1>
            {errors[`${lang}_excerpt`] && (
              <p id="input-field-error" className="govie-error-message">
                <span className="govie-visually-hidden">Error:</span>
                {tError(errors[`${lang}_excerpt`].messageKey, {
                  field: tError(`fields.${errors[`${lang}_excerpt`].field}`),
                  indArticleCheck: "an",
                })}
              </p>
            )}
            <textarea
              id={`${lang}_excerpt`}
              name={`${lang}_excerpt`}
              className="govie-textarea"
              rows={5}
              defaultValue={props.contents?.[lang]?.excerpt}
            ></textarea>
          </div>

          <div
            className={
              errors[`${lang}_plainText`]
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
            {errors[`${lang}_plainText`] && (
              <p id="input-field-error" className="govie-error-message">
                <span className="govie-visually-hidden">Error:</span>
                {tError(errors[`${lang}_plainText`].messageKey, {
                  field: tError(`fields.${errors[`${lang}_plainText`].field}`),
                  indArticleCheck: "",
                })}
              </p>
            )}
            <textarea
              id={`${lang}_plainText`}
              name={`${lang}_plainText`}
              className="govie-textarea"
              rows={15}
              defaultValue={props.contents?.[lang]?.plainText}
            ></textarea>
          </div>
        </React.Fragment>
      ))}
      <button
        disabled={!props.contents?.langs?.length}
        className="govie-button"
      >
        {props.templateId ? "Update" : "Create"}
      </button>
    </form>
  );
};

type State = {
  langs: string[];
  [LANG_EN]?: FormContent;
  [LANG_GA]?: FormContent;
};

export default async (props: {
  params: { locale: string };
  searchParams: { id?: string };
}) => {
  const t = await getTranslations("MessageTemplate");
  const { user, accessToken } =
    await AuthenticationFactory.getInstance().getContext();

  const state = await pgpool
    .query<{
      state: State;
    }>(
      `
        select 
            state
        from message_template_states
        where user_id = $1
    `,
      [user.id],
    )
    .then((res) => res.rows.at(0)?.state);

  const client = new Messaging(accessToken);
  const contents: State = { langs: Array<string>() };

  let templateFetchError: Awaited<
    ReturnType<typeof client.getTemplate>
  >["error"];

  if (props.searchParams.id) {
    const { data, error } = await client.getTemplate(props.searchParams.id);
    if (data?.contents) {
      for (const item of data.contents) {
        contents[item.lang] = item;
        contents.langs.push(item.lang);
      }
    }

    templateFetchError = error;
  }

  if (templateFetchError) {
    return (
      <FlexMenuWrapper>
        <h1>Failed to fetch template </h1>
        <Link className="govie-back-link" href="./">
          {t("backLink")}
        </Link>
      </FlexMenuWrapper>
    );
  }

  const combinedState = Object.assign(contents || {}, state || {});

  return (
    <FlexMenuWrapper>
      <h1>
        <span style={{ margin: "unset" }} className="govie-heading-xl">
          {props.searchParams.id ? "Update template" : "Create a new template"}
        </span>
      </h1>
      <LanguageForm userId={user.id} state={combinedState} />
      {combinedState.langs.length ? (
        <ContentForm
          userId={user.id}
          contents={combinedState}
          templateId={props.searchParams.id}
        />
      ) : null}
      <Link href="./" className="govie-back-link">
        {t("backLink")}
      </Link>
    </FlexMenuWrapper>
  );
};
