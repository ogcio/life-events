import Link from "next/link";
import { web } from "../../../utils";
import ds from "design-system";
import { CSSProperties } from "react";
import { useTranslations } from "next-intl";

const linkStyle = (selected: boolean): CSSProperties => {
  const props: CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "4px 4px 0 0",
    padding: "10px 20px 10px 20px",
    background: selected ? "transparent" : ds.colours.ogcio.lightGrey,
  };
  if (selected) {
    props.border = `1px solid ${ds.colours.ogcio.midGrey}`;
    props.borderStyle = "solid solid none solid";
  }

  return props;
};

const linkClassName = (selected: boolean): string =>
  `govie-link govie-!-font-size-19 govie-link--no-visited-state ${
    selected ? "govie-link--no-underline" : ""
  }`.trim();

export default ({ searchParams }: Pick<web.NextPageProps, "searchParams">) => {
  const t = useTranslations("Admin.StatusMenu");
  const isAll = searchParams?.status === "all";
  const isPending =
    searchParams?.status === "pending" ||
    Boolean(!Object.keys(searchParams ?? {}).length);
  const isApproved = searchParams?.status === "approved";
  const isRejected = searchParams?.status === "rejected";

  return (
    <nav style={{ display: "flex", width: "fit-content", gap: "15px" }}>
      <div style={linkStyle(isAll)}>
        <Link
          href={"?" + new URLSearchParams({ status: "all" }).toString()}
          className={linkClassName(isAll)}
        >
          {t("all")}
        </Link>
      </div>

      <div style={linkStyle(isPending)}>
        <Link
          href={"?" + new URLSearchParams({ status: "pending" }).toString()}
          className={linkClassName(isPending)}
        >
          {t("pending")}
        </Link>
      </div>

      <div style={linkStyle(isApproved)}>
        <Link
          href={"?" + new URLSearchParams({ status: "approved" }).toString()}
          className={linkClassName(isApproved)}
        >
          {t("approved")}
        </Link>
      </div>

      <div style={linkStyle(isRejected)}>
        <Link
          href={"?" + new URLSearchParams({ status: "rejected" }).toString()}
          className={linkClassName(isRejected)}
        >
          {t("rejected")}
        </Link>
      </div>
    </nav>
  );
};
