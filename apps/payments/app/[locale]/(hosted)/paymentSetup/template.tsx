import PaymentsMenu from "./PaymentsMenu";
import { notFound } from "next/navigation";
import { AuthenticationFactory } from "../../../../libraries/authentication-factory";
import { cookies, headers } from "next/headers";

export default async ({ children }) => {
  const context = AuthenticationFactory.getInstance();
  const isPublicServant = await context.isPublicServant();
  if (!isPublicServant) return notFound();

  const organizations = await context.getOrganizations();
  const defaultOrgId = await context.getDefaultOrganization(cookies().get);

  const locale = headers().get("x-next-intl-locale") || "";
  const referer = headers().get("referer") || "";
  const currentPage = referer.split(`/${locale}/`).pop() || "";

  return (
    <div
      style={{
        display: "flex",
        marginTop: "1.3rem",
        gap: "2rem",
      }}
    >
      <PaymentsMenu
        locale={locale}
        organizations={organizations}
        defaultOrganization={defaultOrgId}
        currentPage={currentPage}
      />
      {children}
    </div>
  );
};
