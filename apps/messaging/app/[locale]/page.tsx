import { useTranslations } from "next-intl";
import SideMenu from "./SideMenu";
import { routes } from "../utils";

import { redirect, RedirectType } from "next/navigation";

type Props = {
  params: {
    locale: string;
  };
};

export default ({ children }: React.PropsWithChildren) =>
  redirect("/send-a-message", RedirectType.replace);
