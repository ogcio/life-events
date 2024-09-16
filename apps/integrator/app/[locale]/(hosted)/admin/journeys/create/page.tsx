import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AuthenticationFactory } from "../../../../../../libraries/authentication-factory";
import { PageWrapper } from "../../../PageWrapper";
import {
  JourneyEditor,
  journeySteps,
} from "../../../../../../libraries/journeyEditor";

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

  const editor = new JourneyEditor(journeySteps);
  const steps = editor.getSteps();

  const serverAction = async () => {
    "use server";
  };

  return (
    <PageWrapper locale={locale}>
      <form action={serverAction}>
        <input type="submit" value={"SAVE"} className="govie-button" />
      </form>
    </PageWrapper>
  );
};
