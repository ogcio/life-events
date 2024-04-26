"use server";
import { PgSessions } from "auth/sessions";
import { Messaging } from "building-blocks-sdk";
import { pgpool } from "messages/dbConnection";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";

function options(base: string[], current?: string[]): string[] {
  if (!current) {
    return base;
  }
  const checkup = new Set(current);
  const options: string[] = [];

  for (const item of base) {
    if (checkup.has(item)) {
      continue;
    }

    options.push(item);
  }

  return options;
}

async function getState(userId: string) {
  return await pgpool
    .query<{ state: State }>(
      `

  select state from message_template_states
  where user_id = $1
`,
      [userId],
    )
    .then((res) => res.rows.at(0)?.state);
}

type Content = {
  excerpt: string;
  subject: string;
  plainText: string;
  templateName: string;
  lang: string;
};
type State = {
  content: Content[];
  fields: { value: string; description: string }[];
};

function assignTemplateLiterals(set: Set<string>, s?: string) {
  if (!s) {
    return;
    // return [];
  }
  let scpy = s;
  const xp = /{{([^}]+)}}/;
  let current = xp.exec(scpy);
  // const stash = new Set<string>();
  while (Boolean(current)) {
    const tostash = current?.at(1);
    const tmpl = current?.at(0);
    tostash && set.add(tostash);

    scpy = tmpl ? scpy.slice(scpy.indexOf(tmpl) + tmpl.length) : "";
    current = xp.exec(scpy);
  }

  // return [...stash];
}

export default async (props: {
  searchParams: { id: string; lang?: string };
  params: { locale: string };
}) => {
  const t = await getTranslations("MessageTemplate");
  async function submit(formData: FormData) {
    "use server";
    const subject = formData.get("subject")?.toString() ?? "";
    const excerpt = formData.get("excerpt")?.toString() ?? "";
    const plainText = formData.get("plainText")?.toString() ?? "";
    const templateName = formData.get("templateName")?.toString() ?? "";
    const langAdded = formData.get("lang-add")?.toString();

    const { userId } = await PgSessions.get();
    const lang = props.searchParams.lang!;
    let state = (await getState(userId)) ?? { content: [], fields: [] };

    const stateForUrlQueryLang = state?.content?.find(
      (c) => c.lang === props.searchParams.lang!,
    );
    if (stateForUrlQueryLang) {
      stateForUrlQueryLang.excerpt = excerpt;
      stateForUrlQueryLang.plainText = plainText;
      stateForUrlQueryLang.subject = subject;
      stateForUrlQueryLang.templateName = templateName;
    } else {
      state.content?.push({
        subject,
        excerpt,
        plainText,
        templateName,
        lang: props.searchParams.lang!,
      });
    }

    if (langAdded) {
      state.content.push({
        excerpt: "",
        lang: langAdded,
        plainText: "",
        subject: "",
        templateName: "",
      });
    }

    const fields: Record<string, State["fields"][0]> = {};
    formData.forEach((value, key) => {
      if (!key.startsWith("$ACTION") || key !== "state") {
        if (key === "field") {
          fields[value.toString()] = {
            value: value.toString(),
            description: "",
          };
        } else if (fields[key]) {
          fields[key].description = value.toString();
        }
      }
    });

    // These are fresh parsed from current form change
    const dynamicValuesSet = new Set<string>();
    assignTemplateLiterals(dynamicValuesSet, subject);
    assignTemplateLiterals(dynamicValuesSet, excerpt);
    assignTemplateLiterals(dynamicValuesSet, plainText);
    const formParsedTexts = [...dynamicValuesSet];

    const currentValues = state.fields.map((field) => field.value);
    const valuesToConsider = formParsedTexts.filter((parsed) =>
      currentValues.includes(parsed),
    );

    const nextFields: State["fields"] = [];

    for (const field of formParsedTexts) {
      if (!currentValues.some((v) => v === field)) {
        nextFields.push({
          value: field,
          description: fields[field]?.description ?? "",
        });
      }
    }

    // Check if any were just updated?
    for (const field of state.fields) {
      if (valuesToConsider.some((v) => v === field.value)) {
        field.description = fields[field.value]?.description ?? "";
        nextFields.push(field);
      }
    }

    state.fields = nextFields;

    await pgpool.query(
      `
     insert into message_template_states(user_id, state)
     values($1, $2)
     on conflict(user_id) do update
     set state = message_template_states.state || $2
     where message_template_states.user_id = $1
    `,
      [userId, state],
    );

    revalidatePath("/");
    const langParam = langAdded ? langAdded : lang;

    redirect(
      "?" + new URLSearchParams({ ...props.searchParams, lang: langParam }),
    );
  }

  async function submit2() {
    "use server";
    const { userId } = await PgSessions.get();
    const client = new Messaging(userId);

    const state = await getState(userId);

    if (!state) {
      return;
    }

    const data = {
      variables: state.fields.map((field) => ({
        name: field.value,
        type: field.description,
      })),
      contents: state.content.map((c) => ({ ...c, richText: "" })),
    };

    let error:
      | {
          statusCode?: number | undefined;
          code?: string | undefined;
          error?: string | undefined;
          message?: string | undefined;
        }
      | undefined;

    if (props.searchParams.id) {
      const updateData: Parameters<typeof client.updateTemplate>[1] = {
        variables: data.variables,
        contents: [],
      };
      for (const content of data.contents) {
        updateData.contents.push({ ...content, id: props.searchParams.id });
      }

      const response = await client.updateTemplate(
        props.searchParams.id,
        updateData,
      );
      error = response.error;
    } else {
      const response = await client.createTemplate(data);
      error = response.error;
    }

    if (error) {
      return;
    }

    await pgpool.query(
      `
        delete from message_template_states where user_id = $1
        `,
      [userId],
    );

    redirect("/admin/templates");
  }

  async function changeLang(formData: FormData) {
    "use server";
    const lang = formData.get("lang")!.toString();
    revalidatePath("/");
    redirect("?" + new URLSearchParams({ ...props.searchParams, lang }));
  }

  async function goBack() {
    "use server";
    const { userId } = await PgSessions.get();
    await pgpool.query(
      `
        delete from message_template_states where user_id = $1
        `,
      [userId],
    );
    redirect("/admin/templates");
  }

  const { userId } = await PgSessions.get();
  const client = new Messaging(userId);

  const state = await pgpool
    .query<{ state: State }>(
      `
    select state from message_template_states
    where user_id = $1
  `,
      [userId],
    )
    .then((res) => res.rows.at(0));

  const template = props.searchParams.id
    ? await client.getTemplate(props.searchParams.id)
    : undefined;

  const stateContent = state?.state.content?.find(
    (x) => x.lang === props.searchParams.lang!,
  );

  const templateContent = template?.data?.contents.find(
    (c) => c.lang === props.searchParams.lang!,
  );

  const templateName =
    stateContent?.templateName ?? templateContent?.templateName;
  const subject = stateContent?.subject ?? templateContent?.subject;
  const excerpt = stateContent?.excerpt ?? templateContent?.excerpt;
  const plainText = stateContent?.plainText ?? templateContent?.plainText;

  const fields: State["fields"] =
    state?.state.fields ??
    template?.data?.fields.map((field) => ({
      value: field.fieldName,
      description: field.fieldType,
    })) ??
    [];

  const availableLangOptions = options(
    ["en", "ga"],
    state?.state.content.map((c) => c.lang) ??
      template?.data?.contents?.map((c) => c.lang) ?? [
        props.searchParams.lang || "en",
      ],
  );

  return (
    <>
      {(state?.state?.content ?? template?.data?.contents)?.map((x) => {
        const params = new URLSearchParams({
          ...props.searchParams,
          lang: x.lang,
        });

        return (
          <form action={changeLang}>
            <input type="hidden" value={x.lang} name="lang" />
            <button
              style={{ margin: "unset" }}
              className="govie-button govie-button--small govie-button--outlined"
              disabled={x.lang === props.searchParams.lang}
            >
              {x.lang}
            </button>
          </form>
        );
      })}

      <h1>
        <span className="govie-heading-l">
          {(props.searchParams.id &&
            (state?.state.content ?? template?.data?.contents)?.find(
              (x) => x.lang === props.searchParams.lang,
            )?.templateName) ??
            t("createNewTemplateHeader")}{" "}
          ({props.searchParams.lang})
        </span>
      </h1>

      <p className="govie-body">{t("instructionParagraph")}</p>

      <form action={submit}>
        {availableLangOptions.length ? (
          <div className="govie-form-group">
            <label className="govie-label--s" htmlFor="lang-add">
              {t("addLanguageLanel")}
            </label>
            <div className="govie-hint">{t("addLanguageHint")}</div>

            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <select name="lang-add" id="lang-add" className="govie-select">
                <option value="">{t("emptyDefaultTemplateLangOption")}</option>
                {availableLangOptions.map((lang) => (
                  <option value={lang}>{lang}</option>
                ))}
              </select>

              <button
                className="govie-button govie-button--medium govie-button--outlined"
                style={{ margin: "unset" }}
              >
                {t("add")}
              </button>
            </div>
          </div>
        ) : null}

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
            defaultValue={templateName}
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
            defaultValue={subject}
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
            defaultValue={excerpt}
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
            defaultValue={plainText}
          ></textarea>
        </div>

        <h2>
          <span className="govie-heading-m">{t("templateFieldsHeading")}</span>
        </h2>
        {fields?.map((x) => (
          <div className="govie-form-group">
            <input type="hidden" name="field" value={x.value} />
            <label htmlFor="subject" className="govie-label--s">
              Type description for {x.value}
            </label>
            <div className="govie-hint" id="input-field-hint">
              {x.value}
            </div>
            <input
              type="text"
              name={x.value}
              className="govie-input"
              autoComplete="off"
              defaultValue={x.description}
            />
          </div>
        ))}

        <button type="submit" className="govie-button">
          {t("saveButton")}
        </button>
      </form>

      <form action={submit2}>
        <button
          className="govie-button"
          type="submit"
          disabled={
            !state?.state.content.every((c) => c.subject && c.templateName)
          }
        >
          {props.searchParams.id
            ? t("updateTemplateButton")
            : t("createTemplateButton")}
        </button>
      </form>

      <form action={goBack}>
        <button
          style={{ cursor: "pointer", border: "unset" }}
          className="govie-back-link"
        >
          {t("backLink")}
        </button>
      </form>
    </>
  );
};
