import { redirect } from "next/navigation";
import { MessageCreateProps } from "../../../../utils/messaging";
import { api } from "messages";

import { getTranslations } from "next-intl/server";

export default async (props: MessageCreateProps) => {
  const t = await getTranslations("sendAMessage.SuccessForm");
  async function action() {
    "use server";

    redirect("/admin/send-a-message");
  }

  const { state } = await api.getMessageState(props.userId);

  // Lets silently delete the state since we're done.
  if (props.stateId) {
    await api.deleteMessageState(props.userId, props.stateId);
  }

  const partialSuccess = state.userIds.length > state.successfulMessagesCreated;
  return (
    <>
      <h1>
        <span style={{ margin: "unset" }} className="govie-heading-l">
          {t("title")}
        </span>
      </h1>
      <p className="govie-body">{t("body")}</p>
      {partialSuccess && (
        <div className="govie-error-summary">
          <div>
            <h2>
              <span
                className="govie-error-summary__title"
                style={{ margin: "unset" }}
              >
                {t("partialSuccessError")}
              </span>
            </h2>
          </div>
        </div>
      )}
      <form action={action}>
        <button className="govie-button" type="submit">
          {t("submitText")}
        </button>
      </form>
    </>
  );
};
