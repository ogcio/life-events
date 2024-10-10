import dynamic from "next/dynamic";
import { AuthenticationFactory } from "../../../libraries/authentication-factory";
import { redirect, RedirectType } from "next/navigation";
import { Suspense } from "react";
import PaymentsMenu from "./paymentSetup/PaymentsMenu";
import { getTranslations } from "next-intl/server";
import { OrganizationData } from "auth/types";

type Props = React.PropsWithChildren<{
  locale: string;
  disableOrgSelector?: boolean;
}>;

// load component asynchronously, only when it is needed
const OrganizationSelector = dynamic(
  () => import("shared-components").then((mod) => mod.OrganizationSelector),
  {
    ssr: true,
  },
);

export const PageWrapper = async ({
  children,
  locale,
  disableOrgSelector = false,
}: Props) => {
  const t = await getTranslations("Menu");

  let organizations: OrganizationData[] = [];
  let defaultOrgId: string = "";

  const context = AuthenticationFactory.getInstance();
  const isPublicServant = await context.isPublicServant();

  if (isPublicServant) {
    organizations = Object.values(await context.getOrganizations());
    defaultOrgId = await context.getSelectedOrganization();
  }

  async function handleSubmit(formData: FormData) {
    "use server";
    const context = AuthenticationFactory.getInstance();
    const selectedOrganization = formData.get("organization") as string;
    context.setSelectedOrganization(selectedOrganization);
    redirect("/", RedirectType.replace);
  }

  return (
    <div
      style={{
        display: "flex",
        marginTop: "1.3rem",
        gap: "2rem",
      }}
    >
      <div>
        <section className="sidebar">
          <Suspense fallback={<h3>{t("loading")}</h3>}>
            {organizations && organizations.length > 1 && (
              <OrganizationSelector
                title="Department"
                actionTitle="Change department"
                organizations={organizations.map((org) => ({
                  name: org.name,
                  id: org.id,
                }))}
                defaultOrganization={defaultOrgId}
                handleSubmit={handleSubmit}
                disabled={disableOrgSelector}
              ></OrganizationSelector>
            )}
          </Suspense>

          <PaymentsMenu locale={locale} />
        </section>
      </div>

      <div
        style={{
          width: "100%",
        }}
      >
        <section
          className="main-content"
          style={{
            margin: "1rem 0",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </section>
      </div>
    </div>
  );
};
