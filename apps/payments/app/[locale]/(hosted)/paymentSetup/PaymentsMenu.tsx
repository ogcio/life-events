import Link from "next/link";
import { useTranslations } from "next-intl";
import ds from "design-system";
import styles from "./PaymentsMenu.module.scss";

const Icon = ds.Icon;

type Props = {
  locale: string;
};

export default ({ locale }: Props) => {
  const t = useTranslations("Menu");

  return (
    <>
      <div>
        <div>
          <ol className={`govie-list govie-list--spaced ${styles.container}`}>
            <li tabIndex={0}>
              <Link
                className="govie-button govie-button--icon govie-button--flat govie-!-font-size-16"
                href={`/${locale}/paymentSetup`}
                style={{
                  margin: "unset",
                  paddingLeft: "12px",
                  width: "100%",
                  display: "flex",
                  justifyContent: "flex-start",
                }}
              >
                <Icon
                  icon={"payments"}
                  className="govie-button__icon-left"
                  color={ds.colours.ogcio.darkGreen}
                />
                {t("payments")}
              </Link>
            </li>
            <li tabIndex={0}>
              <Link
                className="govie-button govie-button--icon govie-button--flat govie-!-font-size-16"
                href={`/${locale}/paymentSetup/requests`}
                style={{
                  margin: "unset",
                  paddingLeft: "12px",
                  width: "100%",
                  display: "flex",
                  justifyContent: "flex-start",
                }}
              >
                <Icon
                  icon={"payments"}
                  className="govie-button__icon-left"
                  color={ds.colours.ogcio.darkGreen}
                />
                {t("paymentRequests")}
              </Link>
            </li>
            <li tabIndex={1}>
              <Link
                className="govie-button govie-button--icon govie-button--flat govie-!-font-size-16"
                href={`/${locale}/paymentSetup/providers`}
                style={{
                  margin: "unset",
                  paddingLeft: "12px",
                  width: "100%",
                  display: "flex",
                  justifyContent: "flex-start",
                }}
              >
                <Icon
                  icon={"providers"}
                  className="govie-button__icon-left"
                  color={ds.colours.ogcio.darkGreen}
                />
                {t("providers")}
              </Link>
            </li>
            <li tabIndex={1}>
              <Link
                className="govie-button govie-button--flat govie-!-font-size-16"
                href={`/${locale}/auditLogs`}
                style={{
                  margin: "unset",
                  paddingLeft: "12px",
                  width: "100%",
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              >
                {t("auditLogs")}
              </Link>
            </li>
          </ol>
        </div>
      </div>
    </>
  );
};
