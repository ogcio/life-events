import "design-system/dist/style.css";
import "design-system/dist/esm/index.css";

export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Since queryParams are not passed to the layout, the body element was moved into the page definition.
  return <html lang={locale}>{children}</html>;
}
