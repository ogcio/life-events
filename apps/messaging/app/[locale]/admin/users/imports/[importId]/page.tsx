import { getTranslations } from "next-intl/server";
import { users as usersRoute } from "../../../../../utils/routes";

import React from "react";
import { notFound } from "next/navigation";
import FlexMenuWrapper from "../../../PageWithMenuFlexWrapper";
import dayjs from "dayjs";
import Link from "next/link";
import {
  searchKeyListType,
  searchValueImports,
} from "../../../../../utils/messaging";
import Users from "../../Users";
import { AuthenticationFactory } from "../../../../../utils/authentication-factory";

export default async (props: {
  params: { importId: string; locale: string };
}) => {
  const [t, tCommons] = await Promise.all([
    getTranslations("UsersImport"),
    getTranslations("Commons"),
  ]);
  const { organization } =
    await AuthenticationFactory.getInstance().getPublicServant();
  if (!organization) {
    throw notFound();
  }
  const messagingClient = await AuthenticationFactory.getMessagingClient();
  const { data: userImport, error } = await messagingClient.getUsersImport(
    props.params.importId,
    true,
  );

  const { data: users, error: usersError } =
    await messagingClient.getUsersForImport(props.params.importId, false);

  if (error || !userImport || usersError || !users) {
    throw notFound();
  }

  return (
    <FlexMenuWrapper>
      <h1 className="govie-heading-l">{`${t("title")} - ${dayjs(userImport.importedAt).format("DD/MM/YYYY HH:mm:ss")}`}</h1>
      <Users users={users} />
      <Link
        className="govie-back-link"
        href={
          new URL(
            `${props.params.locale}/${usersRoute.url}?${searchKeyListType}=${searchValueImports}`,
            process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT,
          ).href
        }
      >
        {tCommons("backLink")}
      </Link>
    </FlexMenuWrapper>
  );
};
