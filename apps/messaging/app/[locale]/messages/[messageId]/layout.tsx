import { useTranslations } from "next-intl";
import Link from "next/link";

export default ({ children }: React.PropsWithChildren) => {
  const t = useTranslations("Message");
  return (
    <>
      <div>{children}</div>
      <Link
        className="govie-back-link"
        href={new URL("/messages", process.env.HOST_URL).href}
      >
        {t("back")}
      </Link>
    </>
  );
};
