import { PgSessions } from "auth/sessions";
import { getStates } from "../page";
import Link from "next/link";
import { Messaging } from "building-blocks-sdk";
import { redirect } from "next/navigation";
import FlexMenuWrapper from "../../../PageWithMenuFlexWrapper";
import {
  templateRoutes,
  urlWithSearchParams,
} from "../../../../../utils/routes";

import { LANG_EN, LANG_GA } from "../../../../../../types/shared";
import { getTranslations } from "next-intl/server";

/**
 * Returns unique occurences of values inside double curly brackets {{}}
 * for all string args provided.
 *
 * Compatible with server components
 */
function pluckTemplateLiterals(...text: string[]): string[] {
  if (!text) {
    return [];
  }

  const literals: Record<string, boolean> = {};
  let scpy = text.join();
  // check for {{variable}}
  const xp = /{{([^}]+)}}/;
  let current = xp.exec(scpy);

  while (Boolean(current)) {
    const tostash = current?.[1];
    const tmpl = current?.[0];

    tostash && (literals[tostash] = true);

    scpy = tmpl ? scpy.slice(scpy.indexOf(tmpl) + tmpl.length) : "";
    current = xp.exec(scpy);
  }

  return Object.keys(literals);
}

export default async (props: {
  searchParams?: { id: string; lang: string };
  params: { locale: string };
}) => {
  const tCommons = await getTranslations("Commons");
  const { userId } = await PgSessions.get();
  const states = await getStates(userId);

  async function submitAction() {
    "use server";

    const sdkClient = new Messaging(userId);

    const variableMap: Record<string, boolean> = {};

    for (const state of states) {
      pluckTemplateLiterals(
        state.excerpt,
        state.plainText,
        state.subject,
      ).forEach((val) => (variableMap[val] = true));
    }

    const variables: Parameters<
      typeof sdkClient.createTemplate
    >[0]["variables"] = [];

    const contents: Parameters<typeof sdkClient.createTemplate>[0]["contents"] =
      [];

    for (const state of states) {
      contents.push({ ...state, richText: "" });
    }

    for (const variable of Object.keys(variableMap)) {
      variables.push({ languages: [], name: variable, type: "" });
    }

    if (props.searchParams?.id) {
      const updateContents: ((typeof contents)[0] & { id: string })[] = [];
      for (const content of contents) {
        updateContents.push({ ...content, id: props.searchParams.id });
      }
      const { error } = await sdkClient.updateTemplate(props.searchParams.id, {
        contents: updateContents,
        variables,
      });

      if (!error) {
        return redirect("../");
      }
      return;
    }

    const { error } = await sdkClient.createTemplate({
      contents,
      variables,
    });

    if (!error) {
      redirect("../");
    }
  }

  if (!states.length) {
    return (
      <FlexMenuWrapper>
        <h1>
          <span style={{ margin: "unset" }} className="govie-heading-xl">
            Couldn't find any template in progress!
          </span>
        </h1>
        <Link className="govie-back-link" href="../">
          {tCommons("backLink")}
        </Link>
      </FlexMenuWrapper>
    );
  }

  const english = states.find((state) => state.lang === LANG_EN);
  const gaelic = states.find((state) => state.lang === LANG_GA);

  return (
    <FlexMenuWrapper>
      <h1>
        <span style={{ margin: "unset" }} className="govie-heading-xl">
          Preview
        </span>
      </h1>
      <h2>
        <span style={{ margin: "unset" }} className="govie-heading-l">
          English
        </span>
        <span className="govie-caption-l">{english?.templateName}</span>
      </h2>
      <h3>SMS</h3>
      <p className="govie-body" style={{ maxWidth: "360px" }}>
        {english?.excerpt}
      </p>

      <h3>Email/Message</h3>

      <p className="govie-body">{english?.subject}</p>
      <p className="govie-body govie-!-font-size-16">{english?.plainText}</p>

      <hr className="govie-section-break govie-section-break--visible govie-section-break--xl" />

      <h2>
        <span style={{ margin: "unset" }} className="govie-heading-l">
          Gaelic
        </span>
        <span className="govie-caption-l">{gaelic?.templateName}</span>
      </h2>
      <h3>SMS</h3>
      <p className="govie-body" style={{ maxWidth: "360px" }}>
        {gaelic?.excerpt}
      </p>

      <h3>Email/Message</h3>
      <p className="govie-body "> {gaelic?.subject}</p>
      <p className="govie-body govie-!-font-size-16">{gaelic?.plainText}</p>

      <form action={submitAction}>
        <button className="govie-button">
          {props.searchParams?.id ? "Update" : "Create"}
        </button>
      </form>

      <Link
        className="govie-back-link"
        href={urlWithSearchParams(templateRoutes.url, {
          key: "id",
          value: props.searchParams?.id,
        })}
      >
        Back
      </Link>
    </FlexMenuWrapper>
  );
};
