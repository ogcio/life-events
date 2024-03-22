import { api } from "messages";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async (props: { params: { messageId: string } }) => {
  const message = await api.getMessage(props.params.messageId);
  console.log({ message });
  if (!message) {
    // dunno what to show here :(
    throw notFound();
  }

  const href = message.link.includes("http")
    ? message.link
    : `https://${message.link}`;

  return (
    <>
      <h1 className="govie-heading-l">{message.subject}</h1>
      <p className="govie-body">{message.content}</p>

      <a className="govie-link" href={href}>
        Go to event
      </a>
    </>
  );
};
