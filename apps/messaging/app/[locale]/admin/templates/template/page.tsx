"use server";
import { PgSessions } from "auth/sessions";
import { Messaging } from "building-blocks-sdk";
import { pgpool } from "messages/dbConnection";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const AVAILABLE_LANGUAGES = ["en", "ga"];

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
    .query<{ state: StoredState }>(
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

type StateField = { value: string; description: string };

type State = {
  content: Content[];
  fields: StateField[];
};

type StoredStateField = StateField & { languages: string[] };

type StoredState = Omit<State, "fields"> & { fields: StoredStateField[] };

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
}

const extractVariablesFromFormData = (formData: {
  subject: string;
  excerpt: string;
  plainText: string;
}): Set<string> => {
  const { subject, excerpt, plainText } = formData;
  const dynamicValuesSet = new Set<string>();
  assignTemplateLiterals(dynamicValuesSet, subject);
  assignTemplateLiterals(dynamicValuesSet, excerpt);
  assignTemplateLiterals(dynamicValuesSet, plainText);

  return dynamicValuesSet;
};

const isVariableNotUsedAnymore = (params: {
  currentLanguage: string;
  fromDbField: StoredStateField;
  varNamesFromTemplateBody: Set<string>;
}): boolean =>
  // is not used anymore if it is not one of the variables
  // set in the just submitted formData and if it is not
  // used in another language
  ((params.fromDbField.languages.length === 1 &&
    params.fromDbField.languages[0] === params.currentLanguage) ||
    params.fromDbField.languages.length === 0) &&
  !params.varNamesFromTemplateBody.has(params.fromDbField.value);

const getLanguagesForVariable = (params: {
  currentlyStored: StoredStateField;
  varsFromFormData: Set<string>;
  currentLanguage: string;
}): string[] => {
  const { currentlyStored, varsFromFormData, currentLanguage } = params;
  const languages = new Set(currentlyStored.languages);
  if (varsFromFormData.has(currentlyStored.value)) {
    languages.add(currentLanguage);

    return [...languages];
  }

  languages.delete(currentLanguage);

  return [...languages];
};

const getToStoreVariable = (params: {
  currentLanguage: string;
  currentlyStored: StoredStateField;
  varsFromFormData: Set<string>;
  varUpdatedValues: Record<string, StateField>;
}): StoredStateField | null => {
  const { currentlyStored, varUpdatedValues } = params;
  // the variable is not in the list of the submitted ones
  if (!varUpdatedValues[currentlyStored.value]) {
    return null;
  }

  return {
    value: currentlyStored.value,
    languages: getLanguagesForVariable(params),
    description: varUpdatedValues[currentlyStored.value].description,
  };
};

const updateAlreadyStoredVariable = (params: {
  varUpdatedValues: Record<string, StateField>;
  varsFromFormData: Set<string>;
  currentLanguage: string;
  currentlyStored: StoredStateField;
}): StoredStateField | null => {
  const {
    varsFromFormData,
    currentLanguage,
    currentlyStored,
    varUpdatedValues,
  } = params;
  // was this field saved only for this language and is not
  // used anymore ?
  if (
    isVariableNotUsedAnymore({
      currentLanguage: params.currentLanguage,
      varNamesFromTemplateBody: varsFromFormData,
      fromDbField: currentlyStored,
    })
  ) {
    return null;
  }
  // check if it set for the current language
  const toStoreVariable = getToStoreVariable({
    currentLanguage,
    varsFromFormData,
    varUpdatedValues,
    currentlyStored,
  });
  if (toStoreVariable !== null) {
    return toStoreVariable;
  }
  // otherwise was stored for other languages
  const currentLanguages = currentlyStored.languages.filter(
    (x) => x !== params.currentLanguage,
  );

  if (currentLanguages.length > 0) {
    return { ...currentlyStored, languages: currentLanguages };
  }

  return null;
};

const manageVariables = (params: {
  formData: {
    subject: string;
    excerpt: string;
    plainText: string;
  };
  currentLanguage: string;
  fromDb: StoredState["fields"];
  varUpdatedValues: Record<string, StateField>;
}): StoredStateField[] => {
  const { currentLanguage, fromDb, varUpdatedValues, formData } = params;

  const varsFromFormData = extractVariablesFromFormData(formData);
  let toStoreVars: StoredStateField[] = [];
  const usedFieldNames: Set<string> = new Set();
  for (const currentlyStored of fromDb) {
    const toStore = updateAlreadyStoredVariable({
      varsFromFormData,
      varUpdatedValues,
      currentLanguage,
      currentlyStored,
    });
    usedFieldNames.add(currentlyStored.value);
    if (toStore !== null) {
      toStoreVars.push(toStore);
    }
  }

  for (const newFieldName of varsFromFormData) {
    if (usedFieldNames.has(newFieldName)) {
      continue;
    }
    // newly added variables from the fields
    const currentField = { value: newFieldName, description: "" };
    toStoreVars.push({ ...currentField, languages: [params.currentLanguage] });
  }

  return toStoreVars;
};

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

    const fields: Record<string, StateField> = {};
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

    state.fields = manageVariables({
      currentLanguage: lang,
      fromDb: state.fields,
      varUpdatedValues: fields,
      formData: { excerpt, plainText, subject },
    });

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
        languages: field.languages,
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

  const getTemplateVarsLanguageMapping = (
    contents: {
      subject?: string;
      excerpt?: string;
      plainText?: string;
      lang: string;
    }[],
  ): Record<string, Set<string>> => {
    const allVariables: Record<string, Set<string>> = {};
    // not optimized, but at the moment I would avoid
    // to update template schema on to also save languages
    for (const contentForLang of contents) {
      const varsForThisLanguage = new Set<string>();
      assignTemplateLiterals(varsForThisLanguage, contentForLang.subject);
      assignTemplateLiterals(varsForThisLanguage, contentForLang.excerpt);
      assignTemplateLiterals(varsForThisLanguage, contentForLang.plainText);

      for (const currentVar of varsForThisLanguage) {
        if (!allVariables[currentVar]) {
          allVariables[currentVar] = new Set();
        }

        allVariables[currentVar].add(contentForLang.lang);
      }
    }

    return allVariables;
  };

  const getFieldsForTemplate = (params: {
    template: any | undefined;
    state: StoredState | undefined;
  }): StoredStateField[] => {
    const { template, state } = params;
    if (state) {
      return state.fields;
    }

    if (!template || !template.data) {
      return [];
    }

    const varsForLanguages = getTemplateVarsLanguageMapping(
      template.data.contents,
    );

    return template.data.fields.map((field) => ({
      value: field.fieldName,
      description: field.fieldType,
      languages: varsForLanguages[field.fieldName] ?? AVAILABLE_LANGUAGES,
    }));
  };

  const { userId } = await PgSessions.get();
  const client = new Messaging(userId);
  const state = await pgpool
    .query<{ state: StoredState }>(
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
  const fields = getFieldsForTemplate({ template, state: state?.state });

  const availableLangOptions = options(
    AVAILABLE_LANGUAGES,
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
