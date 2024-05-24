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

  // Lets silently delete the state since we're done.
  if (props.stateId) {
    await api.deleteMessageState(props.userId, props.stateId);
  }

  return (
    <>
      <h1>
        <span style={{ margin: "unset" }} className="govie-heading-l">
          {t("title")}
        </span>
      </h1>
      <p className="govie-body">{t("body")}</p>
      <form action={action}>
        <button className="govie-button" type="submit">
          {t("submitText")}
        </button>
      </form>
    </>
  );
};
