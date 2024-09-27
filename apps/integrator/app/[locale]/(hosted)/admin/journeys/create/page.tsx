import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { AuthenticationFactory } from "../../../../../../libraries/authentication-factory";
import { PageWrapper } from "../../../PageWrapper";
import { pgpool } from "../../../../../dbConnection";
import Link from "next/link";
import InputField from "../../../../../components/InputField";
import { createJourney } from "../../../../../../libraries/journeyEditor/queries";

type Props = {
  params: {
    locale: string;
  };
};

export default async ({ params: { locale } }: Props) => {
  const tGeneral = await getTranslations("General");
  const t = await getTranslations("Journeys.create");

  const { isPublicServant, organization } =
    await AuthenticationFactory.getInstance().getContext();

  if (!isPublicServant) {
    // TODO: Change this to citizen route
    return notFound();
  }

  const createJourneyAction = async (formData: FormData) => {
    "use server";

    const {
      organization,
      user: { id: userId },
    } = await AuthenticationFactory.getInstance().getContext();

    if (!organization) {
      throw new Error("Unauthorized!");
    }

    const title = formData.get("title") as string;

    const result = await createJourney(pgpool, {
      title,
      organizationId: organization.id,
      userId,
    });

    if (!result.rows?.[0]?.id) {
      throw new Error("Something went wrong!");
    }

    const journeyId = result.rows[0].id;
    redirect(`/${locale}/admin/journeys/configure/${journeyId}`);
  };

  return (
    <PageWrapper locale={locale}>
      <form action={createJourneyAction}>
        <h1 className="govie-heading-l">{t("title")}</h1>
        <p className="govie-body">{t("description")}</p>

        <div className="govie-form-group ">
          <InputField name="title" label="" type="text" />
        </div>

        <input
          type="submit"
          value={tGeneral("continue")}
          className="govie-button"
        />

        <div className="govie-width-container">
          <Link className="govie-link" href={`/${locale}/admin/journeys`}>
            {tGeneral("back")}
          </Link>
        </div>
      </form>
    </PageWrapper>
  );
};
