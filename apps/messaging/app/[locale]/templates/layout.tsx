import { PgSessions } from "auth/sessions";
import { messages, routes } from "../../utils";
import SideMenu from "../SideMenu";
import { getTranslations } from "next-intl/server";

export default async ({ children }: React.PropsWithChildren) => {
  const t = await getTranslations("SideMenu");
  const { publicServant } = await PgSessions.get();
  return (
    <div style={{ display: "flex", gap: "30px", width: "100%" }}>
      <SideMenu
        options={await messages.sideMenuOptions(publicServant)}
        selected={routes.emailTemplates.slug}
      />
      <div style={{ width: "100%" }}>{children}</div>
    </div>
  );
};
