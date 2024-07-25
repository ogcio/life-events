import InfoPage from "./components/Info";
import Dashboard from "./components/Dashboard";
import favicon from "../../public/favicon.ico";
import type { Metadata } from "next";

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
  const isLoggedIn = true;

  if (!isLoggedIn) {
    return <InfoPage locale={props.params.locale}></InfoPage>;
  }

  return <Dashboard locale={props.params.locale}></Dashboard>;
};
