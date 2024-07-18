import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";
import { Metadata } from "next";
import favicon from "../../public/favicon.ico";

export const metadata: Metadata = {
  title: "Messaging",
  icons: [{ rel: "icon", url: favicon.src }],
};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={params.locale}>
      <body
        style={{
          margin: "unset",
          minHeight: "100vh",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </body>
    </html>
  );
}
