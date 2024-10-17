import "./styles/globals.scss";
import { Metadata } from "next";
import favicon from "../public/favicon.ico";
import AnalyticsTracker from "analytics/components/AnalyticsTracker";
import AnalyticsEventSender from "analytics/components/AnalyticsEventSender";

export const metadata: Metadata = {
  title: "Payments",
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
        {/* ANALYTICS TRACKER COMPONENTS*/}
        <AnalyticsEventSender></AnalyticsEventSender>
        <AnalyticsTracker></AnalyticsTracker>
        {children}
      </body>
    </html>
  );
}
