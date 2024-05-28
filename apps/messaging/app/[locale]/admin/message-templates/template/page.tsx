export const fetchCache = "force-no-store";

import { PgSessions } from "auth/sessions";
import { pgpool } from "messages/dbConnection";
import { getTranslations } from "next-intl/server";
import { AVAILABLE_LANGUAGES } from "../../../../../types/shared";
import { revalidatePath } from "next/cache";
import { linkClassName, linkStyle } from "../../providers/page";
import { templateRoutes } from "../../../../utils/routes";
import { temporaryMockUtils } from "messages";
import { redirect } from "next/navigation";

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

async function getStates(userId: string) {
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

async function getState(userId: string, lang: string) {
  return pgpool
    .query<{ content: Content }>(
      `
      select 
      state -> $1 as content
      from message_template_states
      where user_id = $2 
      `,
      [lang, userId],
    )
    .then((res) => res.rows.at(0)?.content);
}

function parseLang(test?: string) {
  if (!test || !AVAILABLE_LANGUAGES.includes(test)) {
    return AVAILABLE_LANGUAGES?.[0] ?? "en";
  }

  return test;
}

export default async (props: {
  searchParams?: { id: string; lang: string };
}) => {
  const [t, tError] = await Promise.all([
    getTranslations("MessageTemplate"),
    getTranslations("formErrors"),
  ]);

  async function submitAction(formData: FormData) {
    "use server";

    // Check current form for errors
    const templateName = formData.get("templateName")?.toString();
    const excerpt = formData.get("excerpt")?.toString();
    const plainText = formData.get("plainText")?.toString();
    const subject = formData.get("subject")?.toString();
    const id = formData.get("id")?.toString();

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

    const nextState = {
      [currentLang]: {
        excerpt,
        plainText,
        subject,
        templateName,
        lang: currentLang,
      },
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

    revalidatePath("/");
  }

  async function previewAction() {
    "use server";
    const { userId } = await PgSessions.get();

    // grab the state
    const states = await getStates(userId);

    const formErrors: FormErrors = [];

    // No state at all
    if (!states.length) {
    }

    const expectedFields: Array<
      keyof Pick<Content, "excerpt" | "plainText" | "subject" | "templateName">
    > = ["excerpt", "plainText", "subject", "templateName"];

    let firstFaultyLang: string | undefined;
    for (const lang of AVAILABLE_LANGUAGES) {
      const state = states.find((s) => s.lang === lang);
      if (!state) {
        if (!firstFaultyLang) {
          firstFaultyLang = lang;
        }
        for (const field of expectedFields)
          formErrors.push({ errorValue: "", field, messageKey: "empty" });
        break;
      }

      for (const field of Object.keys(state)) {
        console.log({ state, field });
        if (!state[field]) {
          firstFaultyLang = lang;
          formErrors.push({ errorValue: "", field, messageKey: "empty" });
        }
      }
    }

    console.log(":D", formErrors, firstFaultyLang);
    if (formErrors.length && firstFaultyLang) {
      await temporaryMockUtils.createErrors(
        formErrors,
        userId,
        errorStateId(firstFaultyLang),
      );

      const url = new URL(templateRoutes.url, process.env.HOST_URL);
      url.searchParams.append(searchLangKey, firstFaultyLang);
      // revalidatePath("/");
      return redirect(url.href);
    }

    // let's move to preview!
    console.log("yay lets preview/create?");
  }

  const { userId } = await PgSessions.get();
  let contents: Content[] = [];
  const lang = parseLang(props.searchParams?.lang);
  const isEn = lang === "en";
  const isGa = lang === "ga";

  if (props.searchParams?.id) {
    //  Just select
  } else {
    //  Let's delete state on back action and possibly on parent page?
    contents = await getStates(userId);
  }

  console.log(contents);
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

  console.log(formErrors);

  return (
    <>
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
            href={(() => {
              const url = new URL(templateRoutes.url, process.env.HOST_URL);
              url.searchParams.append(searchLangKey, "en");
              return url.href;
            })()}
            className={linkClassName(isEn)}
          >
            English
          </a>
        </div>
        <div style={linkStyle(isGa)}>
          <a
            href={(() => {
              const url = new URL(templateRoutes.url, process.env.HOST_URL);
              url.searchParams.append(searchLangKey, "ga");
              return url.href;
            })()}
            className={linkClassName(isGa)}
          >
            Gaelic
          </a>
        </div>
      </nav>

      <form action={submitAction}>
        <button className="govie-button">Save</button>

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
        <button className="govie-button">Save</button>
      </form>
      <form action={previewAction}>
        <button
          disabled={contents.length !== AVAILABLE_LANGUAGES.length}
          className="govie-button"
        >
          Preview
        </button>
      </form>
    </>
  );
};
