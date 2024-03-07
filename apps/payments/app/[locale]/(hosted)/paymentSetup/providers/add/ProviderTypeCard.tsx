import Link from "next/link";
import { useTranslations } from "next-intl";

type Props = {
  title: string;
  description: string;
  href: string;
  recommended?: boolean;
};

export default ({ title, description, href, recommended }: Props) => {
  const t = useTranslations("PaymentSetup.AddProvider");

  return (
    <div>
      {recommended && <span className="govie-caption-m">Recommended</span>}
      <h1 className="govie-heading-m">{title}</h1>
      <p className="govie-body">{description}</p>
      <Link href={href}>
        <button id="button" data-module="govie-button" className="govie-button">
          {t("select")} {title}
        </button>
      </Link>
      <hr className="govie-section-break govie-section-break--visible govie-section-break--m" />
    </div>
  );
};
