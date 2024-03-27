import { useTranslations } from "next-intl";
import { messages, routes } from "../../utils";
import SideMenu from "../SideMenu";
import { PgSessions } from "auth/sessions";

export default async ({ children }: React.PropsWithChildren) => {
  const { publicServant } = await PgSessions.get();
  return (
    <div style={{ display: "flex", gap: "30px", width: "100%" }}>
      <SideMenu
        options={await messages.sideMenuOptions(publicServant)}
        selected={routes.sendAMessage.slug}
      />
      <div style={{ width: "100%" }}>{children}</div>
    </div>
  );
};
