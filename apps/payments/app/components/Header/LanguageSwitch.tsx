import ds from "design-system";
import { headers } from "next/headers";

export default () => {
  const pathSlice = headers().get("x-pathname")?.split("/") ?? [];
  const path = pathSlice.slice(2)?.join("/") || "";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <a
        className={`govie-link govie-link--inverse govie-link--no-underline ${
          pathSlice.at(1) === "en" ? "govie-!-font-weight-bold" : ""
        }`.trim()}
        href={new URL("/en/" + path, process.env.HOST_URL).href}
      >
        English
      </a>
      <div
        style={{
          height: "14px",
          width: "1px",
          borderLeft: `1px solid ${ds.colours.ogcio.white}`,
        }}
      />

      <a
        className={`govie-link govie-link--inverse govie-link--no-underline  ${
          pathSlice.at(1) === "ga" ? "govie-!-font-weight-bold" : ""
        }`.trim()}
        href={new URL("/ga/" + path, process.env.HOST_URL).href}
      >
        Gaelic
      </a>
    </div>
  );
};
