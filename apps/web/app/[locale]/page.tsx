import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations('Index');
  return (
    <div>
      <h1>{t('title')}</h1>
      <Link href="/about">About </Link>
    </div>
  );
}
