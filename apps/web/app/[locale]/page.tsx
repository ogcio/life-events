import { redirect, RedirectType } from "next/navigation";
import { routes } from "../utils";

type Props = {
  params: {
    locale: string;
  };
};

export default (props: Props) => {
  const path = `${props.params.locale}/${routes.events.slug}`;
  redirect(path, RedirectType.replace);
};
