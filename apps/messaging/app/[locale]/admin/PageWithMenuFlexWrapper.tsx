import { headers } from "next/headers";
import { RedirectType, redirect } from "next/navigation";
import SideMenu from "../SideMenu";
import { messages } from "../../utils";
import { LANG_EN } from "../../../types/shared";
import { AuthenticationContextFactory } from "auth/authentication-context-factory";

export default async ({ children }: { children: React.ReactNode }) => {
  const isPublicServant = await AuthenticationContextFactory.isPublicServant();
  if (!isPublicServant) {
    redirect("/messages", RedirectType.replace);
  }

  const user = await AuthenticationContextFactory.getUser();
  const pathnameSplit = (headers().get("x-pathname") || "").split("/");
  const selected =
    pathnameSplit.slice(pathnameSplit.indexOf("admin") + 1).at(0) || "";

  return (
    <div style={{ display: "flex", gap: "30px", width: "100%" }}>
      <SideMenu
        locale={headers().get("x-next-intl-locale")?.toString() || LANG_EN}
        options={await messages.sideMenuOptions(isPublicServant)}
        selected={selected}
        userName={user.name ?? ""}
      />
      <div style={{ width: "100%", margin: "0 0 50px 0" }}>{children}</div>
    </div>
  );
};
