import InfoPage from "./components/Info";
import Dashboard from "./components/Dashboard";
import favicon from "../../public/favicon.ico";
import type { Metadata } from "next";
import { AuthenticationFactory } from "../../libraries/authentication-factory";

export const metadata: Metadata = {
  title: "Building Blocks",
  icons: [{ rel: "icon", url: favicon.src }],
};

type Props = {
  params: {
    locale: string;
  };
};

export default async (props: Props) => {
  const instance = AuthenticationFactory.getInstance();
  const isLoggedIn = await instance.isAuthenticated();

  if (!isLoggedIn) {
    return <InfoPage locale={props.params.locale}></InfoPage>;
  }

  const context = await instance.getContext();
  const userRoles = (context.organization?.roles ?? []).map((role) => {
    return role.split(":").pop()!;
  });

  if (context.isPublicServant) {
    return (
      <Dashboard locale={props.params.locale} userRoles={userRoles}></Dashboard>
    );
  }

  // Fallback to Landing page
  return <InfoPage locale={props.params.locale}></InfoPage>;
};
