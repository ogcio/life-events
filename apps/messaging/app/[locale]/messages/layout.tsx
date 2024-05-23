import { messages, routes } from "../../utils";
import SideMenu from "../SideMenu";
import { PgSessions } from "auth/sessions";

export default async ({ children }: { children: React.ReactNode }) => {
  const { publicServant, firstName, lastName } = await PgSessions.get();
  return (
    <div style={{ display: "flex", gap: "30px" }}>
      <SideMenu
        options={await messages.sideMenuOptions(publicServant)}
        selected={routes.messages.slug}
        userName={`${firstName} ${lastName}`}
      />
      <div style={{ width: "100%" }}>{children}</div>
    </div>
  );
};
