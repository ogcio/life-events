import { getTranslations } from "next-intl/server";

export default async (props: { status?: string }) => {
  const t = await getTranslations("PaymentSetup.Providers.status");
  const { status } = props;

  switch (status) {
    case "connected":
      return (
        <strong className="govie-tag govie-tag--blue">{t("connected")}</strong>
      );
    case "disconnected":
      return (
        <strong className="govie-tag govie-tag--yellow">
          {t("disconnected")}
        </strong>
      );
    default:
      return (
        <strong className="govie-tag govie-tag--grey">{t("unknown")}</strong>
      );
  }
};
