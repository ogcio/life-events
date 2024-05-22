import { PgSessions } from "auth/sessions";
import { headers } from "next/headers";
import { RedirectType, redirect } from "next/navigation";
import SideMenu from "../SideMenu";
import { messages } from "../../utils";

export default async ({ children }: { children: React.ReactNode }) => {
  const { publicServant, firstName, lastName } = await PgSessions.get();

  if (!publicServant) {
    redirect("/messages", RedirectType.replace);
  }
  const pathnameSplit = (headers().get("x-pathname") || "").split("/");
  const selected =
    pathnameSplit.slice(pathnameSplit.indexOf("admin") + 1).at(0) || "";

  return (
    <div style={{ display: "flex", gap: "30px", width: "100%" }}>
      <SideMenu
        options={await messages.sideMenuOptions(publicServant)}
        selected={selected}
        userName={`${firstName} ${lastName}`}
      />
      <div style={{ width: "100%", margin: "0 0 50px 0" }}>{children}</div>
    </div>
  );
};
