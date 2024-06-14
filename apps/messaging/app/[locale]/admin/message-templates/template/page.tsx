export const fetchCache = "force-no-store";

import { PgSessions } from "auth/sessions";
import { pgpool } from "messages/dbConnection";
import { getTranslations } from "next-intl/server";
import {
  AVAILABLE_LANGUAGES,
  LANG_EN,
  LANG_GA,
} from "../../../../../types/shared";
import { revalidatePath } from "next/cache";
import { linkClassName, linkStyle } from "../../providers/page";
import { urlWithSearchParams, templateRoutes } from "../../../../utils/routes";
import { temporaryMockUtils } from "messages";
import { redirect } from "next/navigation";
import FlexMenuWrapper from "../../PageWithMenuFlexWrapper";
import Link from "next/link";

const searchLangKey = "lang";
const errorStateId = (lang: string) => `${lang}_template_form`;

type Content = {
  excerpt: string;
  subject: string;
  plainText: string;
  templateName: string;
  lang: string;
};

type FormErrors = Parameters<typeof temporaryMockUtils.createErrors>[0];

export async function getStates(userId: string) {
  return pgpool
    .query<{ state: Record<string, Content> }>(
      `
      select 
      state 
      from message_template_states
      where user_id = $1
      `,
      [userId],
    )
    .then((res) => {
      return Object.values(res.rows.at(0)?.state ?? {});
    });
}

function parseLang(test?: string) {
  if (!test || !AVAILABLE_LANGUAGES.includes(test)) {
    return AVAILABLE_LANGUAGES?.[0] ?? LANG_EN;
  }

  return test;
}

export default async (props: {
  searchParams?: { id: string; lang: string };
  params: { locale: string };
}) => {
  const [t, tError] = await Promise.all([
    getTranslations("MessageTemplate"),
    getTranslations("formErrors"),
  ]);

  async function saveAction(formData: FormData) {
    "use server";

    // Check current form for errors
    const templateName = formData.get("templateName")?.toString();
    const excerpt = formData.get("excerpt")?.toString();
    const plainText = formData.get("plainText")?.toString();
    const subject = formData.get("subject")?.toString();

    const required = { templateName, excerpt, plainText, subject };
    const formErrors: FormErrors = [];

    for (const field of Object.keys(required)) {
      if (!required[field]) {
        formErrors.push({
          errorValue: "",
          field,
          messageKey: "empty",
        });
      }
    }

    const { userId } = await PgSessions.get();
    const currentLang = parseLang(props.searchParams?.lang);

    if (formErrors.length) {
      await temporaryMockUtils.createErrors(
        formErrors,
        userId,
        errorStateId(currentLang),
      );
      return revalidatePath("/");
    }

    // For ts. They can never actually be empty at this point
    if (!templateName || !excerpt || !plainText || !subject) {
      return;
    }

    // If we edit a template, we must include the unchanged data in the state.
    const states = await getStates(userId);
    const isFirstEdit = !states.some(
      (state) => state.lang !== props.searchParams?.lang,
    );

    const carryState = {};
    if (props.searchParams?.id && isFirstEdit) {
      const otherContent = await pgpool
        .query<Content>(
          `
        select 
          excerpt,
          subject,
          lang,
          plain_text as "plainText",
          template_name as "templateName"
        from message_template_contents
        where template_meta_id = $1 and lang != $2
      `,
          [props.searchParams?.id, currentLang],
        )
        .then((res) => res.rows);

      for (const content of otherContent) {
        carryState[content.lang] = content;
      }
    }

    const nextState = {
      [currentLang]: {
        excerpt,
        plainText,
        subject,
        templateName,
        lang: currentLang,
      },
      ...carryState,
    };

    await pgpool.query(
      `
      insert into message_template_states(user_id, state)
      values ($1, $2)
      on conflict(user_id) do
      update set 
          state = message_template_states.state || $2
      where message_template_states.user_id = $1`,
      [userId, nextState],
    );

    // If we dont do this check, all paths gets revalidated it seems, flushing the cache.
    if (states.length || props.searchParams?.id) {
      revalidatePath("/[locale]/admin/message-template/template", "page");
    }
  }

  async function previewAction() {
    "use server";

    // let's move to preview!
    const url = urlWithSearchParams(
      `${props.params.locale}/${templateRoutes.url}/preview`,
      { key: "id", value: props.searchParams?.id },
    );

    redirect(url.href);
  }

  const { userId } = await PgSessions.get();
  let contents: Content[] = await getStates(userId);

  const initStateSize = contents.length;

  const lang = parseLang(props.searchParams?.lang);
  const isEn = lang === LANG_EN;
  const isGa = lang === LANG_GA;

  // No editing of existing template case
  if (props.searchParams?.id && !contents.length) {
    contents = await pgpool
      .query<Content>(
        `
      select
        template_name as "templateName",
        subject,
        plain_text as "plainText",
        lang,
        excerpt
      from message_template_contents
      where template_meta_id = $1
    `,
        [props.searchParams.id],
      )
      .then((res) => res.rows);
  }

  const content = contents.find((c) => c.lang === lang);

  const formErrors = await temporaryMockUtils.getErrors(
    userId,
    errorStateId(lang),
  );

  const errorLookup = formErrors.reduce<Record<string, (typeof formErrors)[0]>>(
    (lookup, err) => {
      lookup[err.field] = err;
      return lookup;
    },
    {},
  );

  return (
    <FlexMenuWrapper>
      <h1>
        <span className="govie-heading-xl">{t("createNewTemplateHeader")}</span>
      </h1>

      <nav
        style={{
          display: "flex",
          width: "fit-content",
          gap: "15px",
          marginBottom: "15px",
        }}
      >
        <div style={linkStyle(isEn)}>
          <a
            href={
              urlWithSearchParams(
                `${props.params.locale}/${templateRoutes.url}`,
                { key: searchLangKey, value: LANG_EN },
                { key: "id", value: props.searchParams?.id },
              ).href
            }
            className={linkClassName(isEn)}
          >
            {t("menuEnglish")}
          </a>
        </div>
        <div style={linkStyle(isGa)}>
          <a
            href={
              urlWithSearchParams(
                `${props.params.locale}/${templateRoutes.url}`,
                { key: searchLangKey, value: LANG_GA },
                { key: "id", value: props.searchParams?.id },
              ).href
            }
            className={linkClassName(isGa)}
          >
            {t("menuGaelic")}
          </a>
        </div>
      </nav>

      <form action={saveAction}>
        <button className="govie-button">{t("saveButton")}</button>

        <input type="hidden" name="langStep" value={lang} />
        <input type="hidden" name="id" value={props.searchParams?.id} />
        <div
          className={
            errorLookup["templateName"]
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
          {errorLookup["templateName"] && (
            <p id="input-field-error" className="govie-error-message">
              <span className="govie-visually-hidden">Error:</span>
              {tError(errorLookup["templateName"].messageKey, {
                field: tError(`fields.${errorLookup["templateName"].field}`),
                indArticleCheck: "",
              })}
            </p>
          )}
          <input
            type="text"
            id="templateName"
            name="templateName"
            className="govie-input"
            autoComplete="off"
            defaultValue={content?.templateName}
          />
        </div>

        <div
          className={
            errorLookup["subject"]
              ? "govie-form-group govie-form-group--error"
              : "govie-form-group"
          }
        >
          <label htmlFor="subject" className="govie-label--s">
            {t("subjectLabel")}
          </label>
          {errorLookup["subject"] && (
            <p id="input-field-error" className="govie-error-message">
              <span className="govie-visually-hidden">Error:</span>
              {tError(errorLookup["subject"].messageKey, {
                field: tError(`fields.${errorLookup["subject"].field}`),
                indArticleCheck: "",
              })}
            </p>
          )}
          <input
            type="text"
            id="subject"
            name="subject"
            className="govie-input"
            autoComplete="off"
            defaultValue={content?.subject}
          />
        </div>

        <div
          className={
            errorLookup["excerpt"]
              ? "govie-form-group govie-form-group--error"
              : "govie-form-group"
          }
        >
          <h1 className="govie-label-wrapper">
            <label htmlFor="excerpt" className="govie-label--s govie-label--l">
              {t("excerptLabel")}
            </label>
          </h1>
          {errorLookup["excerpt"] && (
            <p id="input-field-error" className="govie-error-message">
              <span className="govie-visually-hidden">Error:</span>
              {tError(errorLookup["excerpt"].messageKey, {
                field: tError(`fields.${errorLookup["excerpt"].field}`),
                indArticleCheck: "an",
              })}
            </p>
          )}
          <textarea
            id="excerpt"
            name="excerpt"
            className="govie-textarea"
            rows={5}
            defaultValue={content?.excerpt}
          ></textarea>
        </div>

        <div
          className={
            errorLookup["plainText"]
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
          {errorLookup["plainText"] && (
            <p id="input-field-error" className="govie-error-message">
              <span className="govie-visually-hidden">Error:</span>
              {tError(errorLookup["plainText"].messageKey, {
                field: tError(`fields.${errorLookup["plainText"].field}`),
                indArticleCheck: "",
              })}
            </p>
          )}
          <textarea
            id="plainText"
            name="plainText"
            className="govie-textarea"
            rows={15}
            defaultValue={content?.plainText}
          ></textarea>
        </div>
        <button className="govie-button">{t("saveButton")}</button>
      </form>
      <form action={previewAction}>
        <button
          disabled={
            // If a new state isnt completed for both langs or it's an unedited existing
            contents.length !== AVAILABLE_LANGUAGES.length || !initStateSize
          }
          className="govie-button"
        >
          {t("previewButton")}
        </button>
      </form>
      <Link className="govie-back-link" href="./">
        Back
      </Link>
    </FlexMenuWrapper>
  );
};
