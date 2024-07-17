import "./styles/globals.scss";
import { Metadata } from "next";
import favicon from "../public/favicon.ico";

export const metadata: Metadata = {
  title: "Payments building block",
  icons: [
    {
      rel: "icon",
      url: favicon.src,
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
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
