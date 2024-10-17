import { useTranslations } from "next-intl";
import Link from "next/link";

export default ({ children }: React.PropsWithChildren) => {
  const t = useTranslations("Message");
  return (
    <>
      <div>{children}</div>
      <Link
        className="govie-back-link"
        href={
          new URL(
            "/messages",
            process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT,
          ).href
        }
      >
        {t("back")}
      </Link>
    </>
  );
};
