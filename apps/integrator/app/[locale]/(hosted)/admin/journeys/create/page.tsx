import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AuthenticationFactory } from "../../../../../../libraries/authentication-factory";
import { PageWrapper } from "../../../PageWrapper";

type Props = {
  params: {
    locale: string;
  };
};

export default async ({ params: { locale } }: Props) => {
  const t = await getTranslations("Journeys");

  const { isPublicServant } =
    await AuthenticationFactory.getInstance().getContext();

  if (!isPublicServant) {
    // TODO: Change this to citizen route
    return notFound();
  }

  return <PageWrapper locale={locale}>Create a new journey</PageWrapper>;
};
