import { getTranslations } from "next-intl/server";
import TemplatesList from "./TemplatesList";
import FlexMenuWrapper from "../PageWithMenuFlexWrapper";
import Link from "next/link";
import { messages, messageTemplates } from "../../../utils/routes";
import { redirect } from "next/navigation";
import { Messaging } from "building-blocks-sdk";
import { PgSessions } from "auth/sessions";

export default async (props: {
  params: { locale: string };
  searchParams?: { delete_id?: string };
}) => {
  const t = await getTranslations("MessageTemplates");

  async function createNewAction() {
    "use server";

    const url = new URL(
      `${messageTemplates.url}/template`,
      process.env.HOST_URL,
    );
    url.searchParams.append("lang", "en");

    redirect(url.href);
  }

  let messageNameToDelete: string | undefined;

  if (props.searchParams?.delete_id) {
    const { userId: authToken } = await PgSessions.get();
    const client = new Messaging(authToken);
    const tmpl = await client.getTemplate(props.searchParams?.delete_id);
    const content =
      tmpl.data?.contents.find((content) => content.lang === "en") ||
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
    const url = new URL(
      `${props.params.locale || "en"}/${messageTemplates.url}`,
      process.env.HOST_URL,
    );
    redirect(url.href);
  }

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

      {messageNameToDelete && (
        <div
          className="govie-modal"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100vh",
            width: "100vw",
          }}
        >
          <div className="govie-modal--overlay"></div>
          <div className="govie-modal--content">
            <div className="govie-modal--close-button-container">
              <span data-module="govie-tooltip">
                <form action={handleCancelDelete}>
                  <button
                    data-module="govie-icon-button"
                    className="govie-icon-button"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"
                        fill="#505A5F"
                      ></path>
                    </svg>
                    <span className="govie-visually-hidden">Close</span>
                  </button>
                </form>
                <span className="govie-tooltip govie-tooltip--undefined">
                  Close
                </span>
              </span>
            </div>
            <h1 className="govie-heading-s">
              Are you sure you want to delete the saved message?
            </h1>
            <p className="govie-body">{messageNameToDelete}</p>
            <p className="govie-body">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
            <p className="govie-body">
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
              cupidatat non proident, sunt in culpa qui officia deserunt mollit
              anim id est laborum.
            </p>
            <div className="govie-modal--buttons">
              <form action={handleCancelDelete}>
                <button
                  id="cancel button"
                  data-module="govie-button"
                  className="govie-button govie-button--medium govie-button--outlined"
                >
                  Cancel Action
                </button>
              </form>
              <form action={handleDelete}>
                <button
                  id="confirm button"
                  data-module="govie-button"
                  className="govie-button govie-button--medium "
                >
                  Primary Action
                </button>
                <input
                  type="hidden"
                  name="id"
                  value={props.searchParams?.delete_id}
                />
              </form>
            </div>
          </div>
        </div>
      )}

      <TemplatesList />
    </FlexMenuWrapper>
  );
};
