export const fetchCache = "force-no-store";

import { PgSessions } from "auth/sessions";
import { pgpool } from "messages/dbConnection";
import { getTranslations } from "next-intl/server";
import { AVAILABLE_LANGUAGES } from "../../../../../types/shared";
import { revalidatePath } from "next/cache";
import { linkClassName, linkStyle } from "../../providers/page";
import Link from "next/link";
import { templateRoutes } from "../../../../utils/routes";
import { redirect, RedirectType } from "next/navigation";

const searchLangKey = "lang";

type State = Record<string, Content>;

type Content = {
  excerpt: string;
  subject: string;
  plainText: string;
  templateName: string;
  lang: string;
};

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

function isAllLanguagesFilled(langs: string[]) {
  const should = new Set(AVAILABLE_LANGUAGES);
  const have = new Set(langs);
  const diff: string[] = [];
  //   if (should.size != have.size) {
  //     return false;
  //   }
  for (const item of should) {
    if (!have.has(item)) {
      diff.push(item);
      //   return false;
    }
  }

  return diff;
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
  const t = await getTranslations("MessageTemplate");

  async function submitAction(formData: FormData) {
    "use server";
    console.log(":D ", formData.get("broder"));

    // Check current form for errors
    const templateName = formData.get("templateName")?.toString();
    const excerpt = formData.get("excerpt")?.toString();
    const plainText = formData.get("plainText")?.toString();
    const subject = formData.get("subject")?.toString();
    const id = formData.get("id")?.toString();
    // const lang = formData.get("lang")?.toString();

    const currentLang = parseLang(props.searchParams?.lang);
    if (!templateName || !excerpt || !plainText || !subject) {
      return;
    }
    // If we have all langs fullfilled, we create, otherwise we do something else

    const { userId } = await PgSessions.get();
    // const state = await getState(userId, lang);

    const langs = [];

    // const diff = isAllLanguagesFilled(langs);
    // console.log({ diff });
    // if (!diff.length) {
    //   console.log("Vi kan skapa skiten nu och deleta state..");
    //   return;
    // }

    const nextState = {
      [currentLang]: {
        excerpt,
        plainText,
        subject,
        templateName,
        lang: currentLang,
      },
    };

    console.log({ nextState });
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

    // const url = new URL(`${templateRoutes.url}`, process.env.HOST_URL);
    // id && url.searchParams.append("id", id);
    // url.searchParams.set("lang", lang);
    // redirect(url.href, RedirectType.replace);
    revalidatePath("/");
  }

  /**
   * If no id:
   * English form.
   *
   * Next = submit
   * Use state
   * if english && gaelic then create is ok
   *
   *
   *
   * if id:
   * Menu: English | Gaelic
   * <Lang>Form
   */
  const { userId } = await PgSessions.get();
  let content: Content | undefined;

  if (props.searchParams?.id) {
    //  Just select
  } else {
    //  Let's delete state on back action and possibly on parent page?
    content = await getState(userId, props.searchParams?.lang ?? "en");
  }
  const lang = parseLang(props.searchParams?.lang);
  const isEn = lang === "en";
  const isGa = lang === "ga";

  console.log(content?.excerpt, content?.subject, content?.templateName);
  return (
    <>
      <h1>
        <span className="govie-heading-xl">{t("createNewTemplateHeader")}</span>
      </h1>

      <nav style={{ display: "flex", width: "fit-content", gap: "15px" }}>
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
        <div className="govie-form-group">
          <label htmlFor="templateName" className="govie-label--s">
            {t("templateNameLabel")}
          </label>
          <div className="govie-hint" id="input-field-hint">
            {t("templateNameHint")}
          </div>
          <input
            type="text"
            id="templateName"
            name="templateName"
            className="govie-input"
            autoComplete="off"
            defaultValue={content?.templateName}
          />
        </div>

        <div className="govie-form-group">
          <label htmlFor="subject" className="govie-label--s">
            {t("subjectLabel")}
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            className="govie-input"
            autoComplete="off"
            defaultValue={content?.subject}
          />
        </div>

        <div className="govie-form-group">
          <h1 className="govie-label-wrapper">
            <label htmlFor="excerpt" className="govie-label--s govie-label--l">
              {t("excerptLabel")}
            </label>
          </h1>
          <textarea
            id="excerpt"
            name="excerpt"
            className="govie-textarea"
            rows={5}
            defaultValue={content?.excerpt}
          ></textarea>
        </div>

        <div className="govie-form-group">
          <h1 className="govie-label-wrapper">
            <label
              htmlFor="plainText"
              className="govie-label--s govie-label--l"
            >
              {t("plainTextLabel")}
            </label>
          </h1>
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
      <form>
        <button className="govie-button">Preview</button>
      </form>
    </>
  );
};
