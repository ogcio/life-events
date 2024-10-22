import { getTranslations } from "next-intl/server";
import { redirect, RedirectType } from "next/navigation";
import { AuthenticationFactory } from "../../../../../../libraries/authentication-factory";

type Props = {
  params: {
    locale: string;
    journey: string;
  };
};

export default async (props: Props) => {
  const { locale, journey: journeyId } = props.params;

  const t = await getTranslations();

  const { isPublicServant, isInactivePublicServant } =
    await AuthenticationFactory.getInstance().getContext();

  if (isInactivePublicServant) {
    return redirect("/admin/inactivePublicServant", RedirectType.replace);
  }

  if (isPublicServant) {
    return redirect("/admin/journeys", RedirectType.replace);
  }

  return (
    <div className="govie-width-container" style={{ width: "100%" }}>
      <div className="two-columns-layout">
        <div className="column">The journey was completed.</div>
      </div>
    </div>
  );
};
