import ds from "design-system";
import { headers } from "next/headers";
import styles from "./Header.module.scss";

type Theme = "dark" | "light";

const colors: Record<Theme, string> = {
  dark: ds.colours.ogcio.white,
  light: ds.colours.ogcio.darkGreen,
};

export default ({ theme }: { theme: Theme }) => {
  const pathSlice = headers().get("x-pathname")?.split("/") ?? [];
  const path = pathSlice.slice(2)?.join("/") || "";

  return (
    <div className={styles.languagesContainer}>
      <a
        className={`govie-link govie-link--no-underline ${
          pathSlice.at(1) === "en" ? "govie-!-font-weight-bold" : ""
        }`.trim()}
        style={{ color: colors[theme] }}
        href={new URL("/en/" + path, process.env.HOST_URL).href}
      >
        English
      </a>
      <div
        style={{
          height: "14px",
          width: "1px",
          borderLeft: `1px solid ${ds.colours.ogcio.darkGreen}`,
        }}
      />

      <a
        className={`govie-link govie-link--no-underline  ${
          pathSlice.at(1) === "ga" ? "govie-!-font-weight-bold" : ""
        }`.trim()}
        style={{ color: colors[theme] }}
        href={new URL("/ga/" + path, process.env.HOST_URL).href}
      >
        Gaelic
      </a>
    </div>
  );
};
