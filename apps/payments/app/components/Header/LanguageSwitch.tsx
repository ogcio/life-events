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

  return (
    <form>
      <div className={styles.languagesContainer}>
        <button
          className={styles.languageSwitch}
          style={{
            color: colors[theme],
            fontWeight: lang === "en" ? 700 : 400,
          }}
          formAction={englishHandler}
        >
          English
        </button>

        <div
          style={{
            height: "14px",
            width: "1px",
            borderLeft: `1px solid ${colors[theme]}`,
          }}
        />

        <button
          className={styles.languageSwitch}
          style={{
            color: colors[theme],
            fontWeight: lang === "ga" ? 700 : 400,
          }}
          formAction={gaelicHandler}
        >
          Gaeilge
        </button>
      </div>
    </form>
  );
};
