import { Footer, PhaseBanner, Link, Container } from "@govie-react/ds";
import Header from "../Header";
import { getTranslations } from "next-intl/server";
import { getLinks } from "../../utils/messaging";

/***
 * There's no real layouts currently available from the govie-ds
 * and we need something placeholder to let main take appropriate size.
 *
 * The body is styled as a flex column
 */
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
