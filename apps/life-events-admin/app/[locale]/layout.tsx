import React from "react";
import "@govie-ds/theme-govie/theme.css";
import "@govie-ds/react/styles.css";
import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";
import { Container, Footer, Header, Heading } from "@govie-ds/react";
import { LANG_EN, LANG_GA } from "../../utils/locale";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AuthenticationFactory } from "../../utils/authentication-factory";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Life events Admin",
  description: "Lorem ipsum...",
};

export default async function RootLayout(
  props: React.PropsWithChildren<{ params: { locale: string } }>,
) {
  const { user, isPublicServant } =
    await AuthenticationFactory.getInstance().getContext();

  const tHome = await getTranslations("Home");
  const oppositeLanguage = props.params.locale === LANG_EN ? LANG_GA : LANG_EN;
  const path = headers().get("x-pathname");

  const languageToggleUrl = new URL(
    `${process.env.NEXT_PUBLIC_LEA_SERVICE_ENTRY_POINT!}${path ? `${path.replace(/(\/en|\/ga)/, `/${oppositeLanguage}`)}` : ""}`,
  );

  languageToggleUrl.search = headers().get("x-search") || "";

  const oppositeLanguageLabel =
    props.params.locale === LANG_EN
      ? tHome("gaeilgeMenuLabel")
      : tHome("englishMenuLabel");

  const languages = [
    { href: languageToggleUrl.href, label: oppositeLanguageLabel },
  ];

  return (
    <html lang={props.params.locale}>
      <body
        style={{
          margin: "unset",
          minHeight: "100vh",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Header
          logo={{ href: "" }}
          languages={languages}
          navLinks={[{ href: "", label: "123" }]}
          tools={{ items: [{ href: "/signout", icon: "logout" }] }}
        ></Header>
        <main style={{ flex: "auto" }}>
          <Container>
            {!isPublicServant ? (
              <Heading>This is not for you!</Heading>
            ) : (
              props.children
            )}
          </Container>
        </main>
        <Footer></Footer>
      </body>
    </html>
  );
}
