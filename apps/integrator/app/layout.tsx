import "./styles/globals.scss";
import { Metadata } from "next";
import favicon from "../public/favicon.ico";

export const metadata: Metadata = {
  title: "Integrator",
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
      <body>{children}</body>
    </html>
  );
}
