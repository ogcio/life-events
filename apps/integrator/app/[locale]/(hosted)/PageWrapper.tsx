import dynamic from "next/dynamic";
import { AuthenticationFactory } from "../../../libraries/authentication-factory";
import { redirect, RedirectType } from "next/navigation";
import { Suspense } from "react";
import { OrganizationData } from "auth/types";
import { getTranslations } from "next-intl/server";

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
  const t = await getTranslations("Journeys");
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

  const userName = (await context.getUser()).name;

  return (
    <div
      style={{
        display: "flex",
        marginTop: "1.3rem",
        gap: "2rem",
      }}
    >
      <div>
        <section className="sidebar" style={{ width: "220px" }}>
          <Suspense fallback={<h3>{"loading"}</h3>}>
            <h2>{t("organisationSelector.title")}</h2>
            {!disableOrgSelector &&
              organizations &&
              organizations.length > 1 && (
                <OrganizationSelector
                  description={t("organisationSelector.description")}
                  actionTitle="Change"
                  organizations={organizations.map((org) => ({
                    name: org.name,
                    id: org.id,
                  }))}
                  defaultOrganization={defaultOrgId}
                  handleSubmit={handleSubmit}
                  disabled={disableOrgSelector}
                ></OrganizationSelector>
              )}
            {(disableOrgSelector ||
              (organizations && organizations.length == 1)) && (
              <div
                style={{
                  background: "#F2EFE8",
                  padding: "8px 20px 10px",
                  fontWeight: "700",
                  fontSize: "16px",
                }}
              >
                {organizations[0].name}
              </div>
            )}
          </Suspense>
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
