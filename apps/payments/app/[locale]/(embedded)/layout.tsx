import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";

export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={locale}>
      <body
        style={{
          margin: "unset",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div>{children}</div>
      </body>
    </html>
  );
}
