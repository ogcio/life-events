import "./styles/globals.scss";
import AnalyticsTracker from "analytics/components/AnalyticsTracker";

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
        {/* MATOMO ANALYTICS TRACKER */}
        <AnalyticsTracker></AnalyticsTracker>

        {children}
      </body>
    </html>
  );
}
