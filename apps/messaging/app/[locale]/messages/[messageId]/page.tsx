import { PgSessions } from "auth/sessions";
import { api } from "messages";
import { notFound } from "next/navigation";

export default async (props: { params: { messageId: string } }) => {
  const message = await api.getMessage(props.params.messageId);
  if (!message) {
    throw notFound();
  }

  let href = "";
  if (message.link) {
    href = message.link.includes("http")
      ? message.link
      : `https://${message.link}`;
  }

  const { userId } = await PgSessions.get();

  let didPayThePayment = false;
  if (message.paymentRequestId) {
    const q = await fetch(
      `http://localhost:3001/api/transactions?transactionId=${message.paymentRequestId}&userId=${userId}`,
    );

    didPayThePayment = await q.json();
  }

  return (
    <>
      <h1 className="govie-heading-l">{message.subject}</h1>
      <code>{userId}</code>
      <p className="govie-body">{message.content}</p>
      {Boolean(message.paymentRequestId && message.paymentUserId) ? (
        didPayThePayment ? (
          <>You actually paid. Great!</>
        ) : (
          <iframe
            style={{ border: "none" }}
            height={600}
            width="100%"
            src={`http://localhost:3001/en/paymentRequest/pay?id=${userId}&paymentId=${message.paymentRequestId}`}
          />
        )
      ) : null}

      {Boolean(href) && (
        <a className="govie-link" href={href}>
          Go to event
        </a>
      )}
    </>
  );
};
