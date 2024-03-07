import { useTranslations } from "next-intl";
import { redirect } from "next/navigation";

export default function () {
  async function returnToPortalAction() {
    "use server";
    redirect("/events");
  }

  const t = useTranslations('PaymentError')

  return (
    <section style={{ width: "80%" }}>
      <h1 className="govie-heading-l">{t("sorry")}</h1>
      <p className="govie-body">{t("tryAgain")}</p>
      <form action={returnToPortalAction}>
        <button className="govie-button">{t("submitText")}</button>
      </form>
    </section>
  );
}
