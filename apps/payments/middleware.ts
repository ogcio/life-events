import createMiddleware from "next-intl/middleware";
const locales = ["en", "ga"];

export default createMiddleware({ locales, defaultLocale: "en" });

export const config = {
  matcher: ["/((?!static|health|api|_next/static|_next/image|favicon.ico).*)"],
};
