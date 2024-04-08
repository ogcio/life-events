import { PgSessions } from "auth/sessions";
import { api } from "messages";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

export default async (props: { params: { messageId: string } }) => {
  const t = await getTranslations("Message");
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

  let paymentUrl: URL | undefined;
  let didPayThePayment = false;
  if (message.paymentRequestId) {
    paymentUrl = new URL("en/paymentRequest/pay", process.env.PAYMENTS_URL);
    paymentUrl.searchParams.append("id", userId);
    paymentUrl.searchParams.append("paymentId", message.paymentRequestId);

    const transactionUrl = new URL(
      "api/transactions",
      process.env.PAYMENTS_URL,
    );
    transactionUrl.searchParams.append(
      "paymentRequestId",
      message.paymentRequestId,
    );
    transactionUrl.searchParams.append("userId", userId);
    const q = await fetch(transactionUrl.href);

    didPayThePayment = await q.json();
  }

  return (
    <>
      <h1 className="govie-heading-l">{message.subject}</h1>
      <p className="govie-body">{message.content}</p>
      {Boolean(message.paymentRequestId) ? (
        didPayThePayment ? (
          <p className="govie-inset-text">{t("paymentSuccess")}</p>
        ) : (
          <iframe
            style={{ border: "none" }}
            height={600}
            width="100%"
            src={paymentUrl?.href}
          />
        )
      ) : null}

      {Boolean(href) && (
        <a className="govie-link" href={href}>
          {href}
        </a>
      )}
    </>
  );
};
