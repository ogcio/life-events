import { PgSessions } from "auth/sessions";
import { Messaging } from "building-blocks-sdk";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

export default async (props: { params: { messageId: string } }) => {
  const t = await getTranslations("Message");

  const { userId } = await PgSessions.get();

  const { data: message, error } = await new Messaging(userId).getMessage(
    props.params.messageId,
  );

  if (error || !message) {
    throw notFound();
  }

  const href: string[] = [];
  if (message.links?.length) {
    href.push(
      ...message.links.map((link) =>
        link.includes("http") ? link : `https://${link}`,
      ),
    );
  }

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
      <p className="govie-body">{message.excerpt}</p>
      <p className="govie-body">{message.plainText}</p>
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

      {Boolean(href.length) && (
        <>
          {href.map((url) => (
            <a key={url} className="govie-link" href={url}>
              {href}
            </a>
          ))}
        </>
      )}
    </>
  );
};
