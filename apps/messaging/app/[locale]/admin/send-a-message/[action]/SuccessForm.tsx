import { RedirectType, redirect } from "next/navigation";
import { MessageCreateProps } from "../../../../utils/messaging";
import { api } from "messages";
import { useTranslations } from "next-intl";

export default (props: MessageCreateProps) => {
  const t = useTranslations("sendAMessage.SuccessForm");
  async function action() {
    "use server";

    redirect("/send-a-message", RedirectType.replace);
  }

  // Lets silently delete the state since we're done.
  if (props.stateId) {
    api.deleteMessageState(props.userId, props.stateId);
  }

  return (
    <>
      <h1 className="govie-heading-l">{t("title")}</h1>
      <p className="govie-body">{t("body")}</p>
      <form action={action}>
        <button className="govie-button govie-button--secondary" type="submit">
          {t("submitText")}
        </button>
      </form>
    </>
  );
};
