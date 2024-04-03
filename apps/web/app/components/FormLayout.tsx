import Link from "next/link";
import ActionBreadcrumb from "./ActionBreadcrumb";
import { useTranslations } from "next-intl";

export default function FormLayout(
  props: React.PropsWithChildren<{
    action: { slug: string; href?: string };
    step?: string;
    backHref?: string;
    homeHref?: string;
  }>,
) {
  const genericT = useTranslations("Generic");
  return (
    <>
      <ActionBreadcrumb
        action={props.action}
        step={props.step}
        homeHref={props.homeHref}
      />
      {props.children}
      {props.backHref && (
        <Link href={props.backHref} className="govie-back-link">
          {genericT("back")}
        </Link>
      )}
    </>
  );
}
