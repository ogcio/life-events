import { Messaging } from "building-blocks-sdk";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getAuthenticationContext } from "../../logto_integration/config";

export default async (props: { params: { messageId: string } }) => {
  const t = await getTranslations("Message");

  const { accessToken } = await getAuthenticationContext();

  const { data: message, error } = await new Messaging(accessToken).getMessage(
    props.params.messageId,
  );

  if (error || !message) {
    throw notFound();
  }

  return (
    <>
      <h1 className="govie-heading-l">{message.subject}</h1>
      <p className="govie-body">{message.excerpt}</p>
      <p className="govie-body">{message.plainText}</p>
    </>
  );
};
