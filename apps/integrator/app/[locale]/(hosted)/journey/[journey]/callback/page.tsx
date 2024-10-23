import { getTranslations } from "next-intl/server";
import { redirect, RedirectType } from "next/navigation";
import { AuthenticationFactory } from "../../../../../../libraries/authentication-factory";

type Props = {
  params: {
    locale: string;
    journey: string;
  };
  searchParams: {
    runId: string;
    token?: string;
  };
};

const transitionStep = async (
  journeyId: string,
  runId: string,
  token?: string,
) => {
  "use server";

  const client = await AuthenticationFactory.getIntegratorClient();
  const result = await client.transitionStep({
    journeyId,
    runId,
    token,
  });

  return result.data?.data.url;
};

export default async (props: Props) => {
  const { locale, journey: journeyId } = props.params;
  const { runId, token } = props.searchParams;

  const t = await getTranslations();

  const { isPublicServant, isInactivePublicServant } =
    await AuthenticationFactory.getInstance().getContext();

  if (isInactivePublicServant) {
    return redirect("/admin/inactivePublicServant", RedirectType.replace);
  }

  if (isPublicServant) {
    return redirect("/admin/journeys", RedirectType.replace);
  }

  const url = await transitionStep(journeyId, runId, token);

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
