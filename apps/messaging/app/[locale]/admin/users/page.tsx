import Link from "next/link";
import { users as usersRoute } from "../../../utils/routes";
import { getTranslations } from "next-intl/server";
import {
  searchKeyListType,
  searchValueImports,
  searchValueUsers,
} from "../../../utils/messaging";
import Imports from "./Imports";
import Users from "./Users";
import { linkStyle, linkClassName } from "../providers/page";
import FlexMenuWrapper from "../PageWithMenuFlexWrapper";
import { Messaging } from "building-blocks-sdk";
import { PgSessions } from "auth/sessions";

export interface UiUserInvitation {
  id: string;
  userProfileId: string | null;
  organisationId: string;
  organisationInvitationStatus:
    | "to_be_invited"
    | "pending"
    | "accepted"
    | "declined";
  organisationInvitationSentAt?: string;
  organisationInvitationFeedbackAt?: string;
  organisationPreferredTransports?: string[];
  correlationQuality: string;
  userStatus: string;
  phone: string | null;
  email: string | null;
  details?: {
    publicIdentityId: string | null;
    firstName: string | null;
    lastName: string | null;
    birthDate: string | null;
    address: {
      city: string | null;
      zipCode: string | null;
      street: string | null;
      country: string | null;
      region: string | null;
    } | null;
  };
}

export default async (props: {
  params: { locale: string };
  searchParams?: { listType?: string };
}) => {
  const t = await getTranslations("Users");
  const listType = props.searchParams?.listType;
  const isUsers = listType === searchValueUsers || !listType;
  const isImports = listType === searchValueImports;
  let users: UiUserInvitation[] | undefined = [];
  if (isUsers) {
    const { userId } = await PgSessions.get();
    const messagingClient = new Messaging(userId);
    const { data: organisationId } =
      await messagingClient.getMockOrganisationId();
    const { data } = await messagingClient.getUsers(organisationId);
    users = data;
  }
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
              const url = new URL(usersRoute.url, process.env.HOST_URL);
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
              const url = new URL(usersRoute.url, process.env.HOST_URL);
              url.searchParams.append(searchKeyListType, searchValueImports);
              return url.href;
            })()}
            className={linkClassName(isImports)}
          >
            {t("importsLink")}
          </Link>
        </div>
      </nav>
      <div>{isUsers && <Users users={users} />}</div>
      <div>{isImports && <Imports />}</div>
    </FlexMenuWrapper>
  );
};
