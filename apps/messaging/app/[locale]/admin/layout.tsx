import { headers } from "next/headers";
import { messages } from "../../utils";
import SideMenu from "../SideMenu";
import { PgSessions } from "auth/sessions";
import { RedirectType, redirect } from "next/navigation";

export default async ({ children }: React.PropsWithChildren) => {
  const { publicServant } = await PgSessions.get();
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
      />
      <div style={{ width: "100%" }}>{children}</div>
    </div>
  );
};
