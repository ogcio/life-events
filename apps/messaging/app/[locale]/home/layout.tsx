import Main from "./Main";
import Header from "../Header";
import { getTranslations } from "next-intl/server";
import { getLinks } from "../../utils/messaging";
import { Container, Footer, Link, PhaseBanner } from "@govie-ds/react";

export default async function homeLayout(
  props: React.PropsWithChildren<{ params: { locale: string } }>,
) {
  const tBanner = await getTranslations("FeedbackBanner");
  const environment = String(process.env.ENVIRONMENT);
  const links = getLinks(environment, props.params.locale);

  return (
    <>
      <Header locale={props.params.locale} />

      <Main>
        <Container>
          <PhaseBanner level="beta">
            {tBanner.rich("bannerText", {
              mail: (chunks) => (
                <Link href={links.feedbackLink.href}>{chunks}</Link>
              ),
            })}
          </PhaseBanner>
        </Container>

        <Container>{props.children}</Container>
      </Main>
      <Footer />
    </>
  );
}
