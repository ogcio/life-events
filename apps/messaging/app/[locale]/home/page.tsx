import { Footer, Heading, PhaseBanner, Link, Container } from "@govie-react/ds";
import Header from "../Header";
import { getTranslations } from "next-intl/server";
import { getLinks } from "../../utils/messaging";

function Main({ children }: React.PropsWithChildren) {
  return <main style={{ flex: "auto" }}>{children}</main>;
}

export default async (params: { locale: string }) => {
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
