import { Footer, PhaseBanner, Link, Container } from "@govie-react/ds";
import Header from "../Header";
import { getTranslations } from "next-intl/server";
import { getLinks } from "../../utils/messaging";
import Main from "./Main";

export default async ({ params }: { params: { locale: string } }) => {
  const phaseBannerContent = await getTranslations("FeedbackBanner");
  const environment = String(process.env.ENVIRONMENT);
  const links = getLinks(environment, params.locale);

  return (
    <>
      <Header locale={params.locale} />
      <Main>
        <Container>
          <PhaseBanner level="beta">
            {phaseBannerContent.rich("bannerText", {
              mail: (chunks) => (
                <Link href={links.feedbackLink.href}>{chunks}</Link>
              ),
            })}
          </PhaseBanner>
        </Container>
      </Main>
      <Footer />
    </>
  );
};
