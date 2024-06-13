import { PgSessions } from "auth/sessions";
import { getTranslations } from "next-intl/server";
import { users as usersRoute } from "../../../../../utils/routes";
import { Messaging } from "building-blocks-sdk";
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

export default async (props: {
  params: { importId: string; locale: string };
}) => {
  const [t, tCommons] = await Promise.all([
    getTranslations("UsersImport"),
    getTranslations("Commons"),
  ]);
  const { userId } = await PgSessions.get();
  const messagingClient = new Messaging(userId);
  const { data: organisationId } =
    await messagingClient.getMockOrganisationId();
  const { data: userImport, error } = await messagingClient.getUsersImport(
    props.params.importId,
    organisationId,
    true,
  );

  const { data: users, error: usersError } =
    await messagingClient.getUsersForImport(
      props.params.importId,
      organisationId,
    );

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
            process.env.HOST_URL,
          ).href
        }
      >
        {tCommons("backLink")}
      </Link>
    </FlexMenuWrapper>
  );
};
