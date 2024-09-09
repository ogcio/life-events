import { getTranslations } from "next-intl/server";
import { AuthenticationFactory } from "../../../libraries/authentication-factory";
import { redirect, RedirectType } from "next/navigation";
import { PageWrapper } from "./PageWrapper";

type Props = {
  params: {
    locale: string;
  };
};

export default async (props: Props) => {
  const t = await getTranslations();

  const { isPublicServant, isInactivePublicServant } =
    await AuthenticationFactory.getInstance().getContext();

  if (isInactivePublicServant) {
    return redirect("/inactivePublicServant", RedirectType.replace);
  }

  if (!isPublicServant) {
    // Redirect to front page for citizen
  }

  return (
    <PageWrapper locale={props.params.locale}>
      <h1>{t("title")}</h1>
    </PageWrapper>
  );
};
