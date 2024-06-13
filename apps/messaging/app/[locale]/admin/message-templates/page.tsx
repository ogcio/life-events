import { getTranslations } from "next-intl/server";
import TemplatesList from "./TemplatesList";
import FlexMenuWrapper from "../PageWithMenuFlexWrapper";
import {
  urlWithSearchParams,
  messageTemplates,
  templateRoutes,
} from "../../../utils/routes";
import { redirect } from "next/navigation";
import { Messaging } from "building-blocks-sdk";
import { PgSessions } from "auth/sessions";
import { pgpool } from "messages/dbConnection";
import ConfirmDeleteModal from "../ConfirmDeleteModal";
import { LANG_EN } from "../../../../types/shared";

export default async (props: {
  params: { locale: string };
  searchParams?: { delete_id?: string };
}) => {
  const t = await getTranslations("MessageTemplates");

  async function createNewAction() {
    "use server";

    const url = urlWithSearchParams(
      `${props.params.locale}/${templateRoutes.url}`,
      {
        key: "lang",
        value: LANG_EN,
      },
    );
    redirect(url.href);
  }

  let messageNameToDelete: string | undefined;

  if (props.searchParams?.delete_id) {
    const { userId: authToken } = await PgSessions.get();
    const client = new Messaging(authToken);
    const tmpl = await client.getTemplate(props.searchParams?.delete_id);
    const content =
      tmpl.data?.contents.find((content) => content.lang === LANG_EN) ||
      tmpl.data?.contents.at(0);

    messageNameToDelete = content?.templateName;
  }

  async function handleDelete(formData: FormData) {
    "use server";

    const id = formData.get("id")?.toString();
    if (!id) {
      return;
    }
    const { userId: authToken } = await PgSessions.get();
    await new Messaging(authToken).deleteTemplate(id);
    redirect("/");
  }
  async function handleCancelDelete() {
    "use server";
    const url = urlWithSearchParams(
      `${props.params.locale || LANG_EN}/${messageTemplates.url}`,
    );
    redirect(url.href);
  }

  // Flush the template state
  const { userId } = await PgSessions.get();
  await pgpool.query(
    `
    delete from message_template_states
    where user_id = $1
  `,
    [userId],
  );

  return (
    <FlexMenuWrapper>
      <h1>
        <span style={{ margin: "unset" }} className="govie-heading-xl">
          {t("title")}
        </span>
      </h1>

      <form action={createNewAction}>
        <button className="govie-button">{t("createNewButton")}</button>
      </form>

      {messageNameToDelete && props.searchParams?.delete_id && (
        <ConfirmDeleteModal
          resourceDescription="the saved message"
          id={props.searchParams?.delete_id}
          toDelete={messageNameToDelete}
          onCancelAction={handleCancelDelete}
          onDeleteAction={handleDelete}
        />
      )}

      <TemplatesList locale={props.params.locale} />
    </FlexMenuWrapper>
  );
};
