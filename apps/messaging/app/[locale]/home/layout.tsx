import Main from "./Main";
import { getTranslations } from "next-intl/server";
import { getLinks } from "../../utils/messaging";
import { Container, Footer, Link, PhaseBanner, Header } from "@govie-ds/react";
import { LANG_EN, LANG_GA } from "../../../types/shared";
import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function homeLayout(
  props: React.PropsWithChildren<{ params: { locale: string } }>,
) {
  const [tBanner, tHome] = await Promise.all([
    getTranslations("FeedbackBanner"),
    getTranslations("Home"),
  ]);

  const environment = String(process.env.ENVIRONMENT);
  const links = getLinks(environment, props.params.locale);

  const currentUrl = new URL(
    headers().get("x-href") ||
      process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT!,
  );

  const gaUrl = new URL(currentUrl);
  const gaUrlSplit = gaUrl.pathname.split("/");

  if (gaUrlSplit.length > 1) {
    gaUrlSplit[1] = LANG_GA;
    gaUrl.pathname = gaUrlSplit.join("/");
  }

  const enUrl = new URL(currentUrl);
  const enUrlSplit = enUrl.pathname.split("/");
  if (enUrlSplit.length > 1) {
    enUrlSplit[1] = LANG_EN;
    enUrl.pathname = enUrlSplit.join("/");
  }

  const languages =
    props.params.locale === LANG_EN
      ? [{ href: gaUrl.href, label: tHome("gaeilgeMenuLabel") }]
      : [{ href: enUrl.href, label: tHome("englishMenuLabel") }];

  async function headerSearchAction(formData: FormData) {
    "use server";
    const searchValue = formData.get("search_query")?.toString() || "";

    const path = headers().get("x-pathname");
    const url = new URL(
      `${process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT}${path}`,
    );
    url.search = headers().get("x-search") || "";
    url.searchParams.delete("search_query");

    if (searchValue) {
      url.searchParams.set("search_query", searchValue);
    }

    redirect(url.href);
  }

  return (
    <>
      <Header
        tools={{ search: { serverAction: headerSearchAction } }}
        logo={{ href: "/home" }}
        languages={languages}
        title={tHome("messagingTitle")}
        navLinks={[
          {
            href: `/${props.params.locale}/home`,
            label: tHome("messagingNavLabel"),
          },
        ]}
      />

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
