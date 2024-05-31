import ds from "design-system";
import { headers } from "next/headers";
import styles from "./Header.module.scss";
import { redirect, RedirectType } from "next/navigation";

type Theme = "dark" | "light";

const colors: Record<Theme, string> = {
  dark: ds.colours.ogcio.white,
  light: ds.colours.ogcio.darkGreen,
};

export default async ({ theme }: { theme: Theme }) => {
  const lang = headers().get("x-next-intl-locale");

  const handleLanguageChange = async (lang: string) => {
    "use server";

    const referer = headers().get("referer");

    if (!referer) {
      return;
    }

    const url = new URL(referer);
    const pathSlice = url.pathname.split("/");
    let path = pathSlice.slice(2)?.join("/") || "";

    if (url.search) {
      path += url.search;
    }

    return redirect(`/${lang}/${path}`, RedirectType.replace);
  };

  const englishHandler = async () => {
    "use server";
    return handleLanguageChange("en");
  };

  const gaelicHandler = async () => {
    "use server";
    return handleLanguageChange("ga");
  };

  const languages = [
    {
      lang: "en",
      label: "English",
      handler: englishHandler,
    },
    {
      lang: "ga",
      label: "Gaeilge",
      handler: gaelicHandler,
    },
  ];

  return (
    <form>
      <div className={styles.languagesContainer}>
        {languages.map((language, index, arr) => {
          return (
            <>
              <button
                className={styles.languageSwitch}
                style={{
                  color: colors[theme],
                  fontWeight: lang === language.lang ? 700 : 400,
                }}
                formAction={language.handler}
              >
                {language.label}
              </button>

              {index !== arr.length - 1 && (
                <div
                  style={{
                    height: "14px",
                    width: "1px",
                    borderLeft: `1px solid ${colors[theme]}`,
                  }}
                />
              )}
            </>
          );
        })}
      </div>
    </form>
  );
};
