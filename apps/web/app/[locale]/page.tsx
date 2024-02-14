import { redirect, RedirectType } from "next/navigation";
import { routeDefinitions } from "../routeDefinitions";

type Props = {
  params: {
    locale: string;
  };
};

export default (props: Props) => {
  const path = `${props.params.locale}/${routeDefinitions.events.slug}`;
  redirect(path, RedirectType.replace);
};
