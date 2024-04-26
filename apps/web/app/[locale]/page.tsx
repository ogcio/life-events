import { redirect, RedirectType } from "next/navigation";
import { routes } from "../utils";

type Props = {
  params: {
    locale: string;
  };
};

export default (props: Props) => {
  console.log("PUBLIC_ENDPOINT", process.env.NEXT_PUBLIC_API_ENDPOINT);
  const path = `${props.params.locale}/${routes.events.slug}`;
  redirect(path, RedirectType.replace);
};
