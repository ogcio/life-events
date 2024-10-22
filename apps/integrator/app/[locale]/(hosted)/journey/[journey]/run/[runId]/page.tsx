import { getTranslations } from "next-intl/server";
import { redirect, RedirectType } from "next/navigation";
import { AuthenticationFactory } from "../../../../../../../libraries/authentication-factory";

type Props = {
  params: {
    locale: string;
    journey: string;
    runId: string;
  };
};

const executeStep = async (journeyId: string, runId: string) => {
  "use server";

  const client = await AuthenticationFactory.getIntegratorClient();
  const result = await client.executeStep({
    journeyId,
    runId,
  });

  return result.data?.data.url;
};

export default async (props: Props) => {
  const { locale, journey: journeyId, runId } = props.params;

  const t = await getTranslations();

  const { isPublicServant, isInactivePublicServant } =
    await AuthenticationFactory.getInstance().getContext();

  if (isInactivePublicServant) {
    return redirect("/admin/inactivePublicServant", RedirectType.replace);
  }

  if (isPublicServant) {
    return redirect("/admin/journeys", RedirectType.replace);
  }

  const url = await executeStep(journeyId, runId);

  if (!url) {
    return (
      <div className="govie-width-container" style={{ width: "100%" }}>
        <div className="two-columns-layout">
          <div className="column">Something went wrong!</div>
        </div>
      </div>
    );
  }

  redirect(url, RedirectType.replace);
};
