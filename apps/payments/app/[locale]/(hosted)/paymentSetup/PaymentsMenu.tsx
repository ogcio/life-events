import Link from "next/link";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import ds from "design-system";
import styles from "./PaymentsMenu.module.scss";
import { OrganizationData } from "auth/types";
import { AuthenticationFactory } from "../../../../libraries/authentication-factory";
import { redirect, RedirectType } from "next/navigation";
import { Suspense } from "react";

const Icon = ds.Icon;

type Props = {
  locale: string;
  organizations?: OrganizationData[];
  defaultOrganization?: string;
  disableOrgSelector?: boolean;
};

// load component asynchronously, only when it is needed
const OrganizationSelector = dynamic(
  () => import("shared-components").then((mod) => mod.OrganizationSelector),
  {
    ssr: true,
  },
);

export default ({
  locale,
  organizations,
  defaultOrganization,
  disableOrgSelector,
}: Props) => {
  const t = useTranslations("Menu");

  async function handleSubmit(formData: FormData) {
    "use server";
    const context = AuthenticationFactory.getInstance();
    const selectedOrganization = formData.get("organization") as string;
    context.setSelectedOrganization(selectedOrganization);
    redirect("/", RedirectType.replace);
  }

  return (
    <>
      <div>
        <Suspense fallback={<h3>{t("loading")}</h3>}>
          {organizations && organizations.length > 1 && (
            <OrganizationSelector
              title="Department"
              actionTitle="Change department"
              organizations={organizations.map((org) => ({
                name: org.name,
                id: org.id,
              }))}
              defaultOrganization={defaultOrganization}
              handleSubmit={handleSubmit}
              disabled={disableOrgSelector}
            ></OrganizationSelector>
          )}
        </Suspense>
        <div>
          <ol className={`govie-list govie-list--spaced ${styles.container}`}>
            <li tabIndex={0}>
              <Link
                className="govie-button govie-button--icon govie-button--flat govie-button--icon govie-!-font-size-16"
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
                className="govie-button govie-button--icon govie-button--flat govie-button--icon govie-!-font-size-16"
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
                className="govie-button govie-button--icon govie-button--flat govie-button--icon govie-!-font-size-16"
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
          </ol>
        </div>
      </div>
    </>
  );
};
