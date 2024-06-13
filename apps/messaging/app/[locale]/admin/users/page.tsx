import Link from "next/link";
import { users, usersImports } from "../../../utils/routes";
import { getTranslations } from "next-intl/server";
import {
  searchKeyListType,
  searchValueImports,
  searchValueUsers,
} from "../../../utils/messaging";
import Imports from "./Imports";
import { linkStyle, linkClassName } from "../providers/page";
import FlexMenuWrapper from "../PageWithMenuFlexWrapper";

export default async (props: {
  params: { locale: string };
  searchParams?: { listType?: string };
}) => {
  const t = await getTranslations("Users");
  const listType = props.searchParams?.listType;
  const isUsers = listType === searchValueUsers || !listType;
  const isImports = listType === searchValueImports;

  return (
    <FlexMenuWrapper>
      <h1>
        <span style={{ margin: "unset" }} className="govie-heading-l">
          {t("header")}
        </span>
      </h1>
      <nav style={{ display: "flex", width: "fit-content", gap: "15px" }}>
        <div style={linkStyle(isUsers)}>
          <Link
            href={(() => {
              const url = new URL(users.url, process.env.HOST_URL);
              url.searchParams.append(searchKeyListType, searchValueUsers);
              return url.href;
            })()}
            className={linkClassName(isUsers)}
          >
            {t("usersLink")}
          </Link>
        </div>
        <div style={linkStyle(isImports)}>
          <Link
            href={(() => {
              const url = new URL(users.url, process.env.HOST_URL);
              url.searchParams.append(searchKeyListType, searchValueImports);
              return url.href;
            })()}
            className={linkClassName(isImports)}
          >
            {t("importsLink")}
          </Link>
        </div>
      </nav>
      <div>{isUsers && <Imports />}</div>
      <div>{isImports && <Imports />}</div>
    </FlexMenuWrapper>
  );
};
