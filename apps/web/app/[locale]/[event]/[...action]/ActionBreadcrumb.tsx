import { useTranslations } from "next-intl";
import Link from "next/link";

type Props = {
  action: { slug: string; href?: string };
  step: string;
};

export default ({ action, step }: Props) => {
  const t = useTranslations("BreadcrumbsBySlug");
  const actionElement =
    action.href !== undefined ? (
      <Link className="govie-breadcrumbs__link" href={action.href}>
        {t(action.slug)}
      </Link>
    ) : (
      <span className="govie-breadcrumbs__link">{t(action.slug)}</span>
    );
  return (
    <div className="govie-breadcrumbs">
      <ol className="govie-breadcrumbs__list">
        <li className="govie-breadcrumbs__list-item">
          <Link className="govie-breadcrumbs__link" href="/">
            {t("home")}
          </Link>
        </li>
        <li className="govie-breadcrumbs__list-item">{actionElement}</li>
        <li className="govie-breadcrumbs__list-item">
          <span className="govie-breadcrumbs__link">{t(step)}</span>
        </li>
      </ol>
    </div>
  );
};
