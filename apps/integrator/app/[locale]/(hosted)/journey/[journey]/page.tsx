import { getTranslations } from "next-intl/server";
import { AuthenticationFactory } from "../../../../../libraries/authentication-factory";
import { redirect, RedirectType } from "next/navigation";

type Props = {
  params: {
    locale: string;
    journey: string;
  };
};

const createRun = async (journeyId) => {
  "use server";

  const client = await AuthenticationFactory.getIntegratorClient();
  const runId = await client.createRun({
    journeyId,
  });

  return runId.data?.data.id;
};

export default async (props: Props) => {
  const { locale, journey: journeyId } = props.params;

  const t = await getTranslations();

  const {
    isPublicServant,
    isInactivePublicServant,
    user: { id: userId },
  } = await AuthenticationFactory.getInstance().getContext();

  if (isInactivePublicServant) {
    return redirect("/admin/inactivePublicServant", RedirectType.replace);
  }

  if (isPublicServant) {
    return redirect("/admin/journeys", RedirectType.replace);
  }

  const runId = await createRun(journeyId);

  if (!runId) {
    return (
      <div className="govie-width-container" style={{ width: "100%" }}>
        <div className="two-columns-layout">
          <div className="column">Something went wrong!</div>
        </div>
      </div>
    );
  }

  return redirect(`/${locale}/journey/${journeyId}/run/${runId}`);
};
