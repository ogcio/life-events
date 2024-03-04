import { pgpool } from "../../../dbConnection";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

type Props = {
  searchParams: {
    transactionId: string;
    status: string;
  };
};

async function updateTransaction(transactionId: string, status: string) {
  "use server";

  return pgpool.query(
    `
    update payment_transactions
    set status = $1, updated_at = now()
    where transaction_id = $2
    `,
    [status, transactionId]
  );
}

export default async function Page(props: Props) {
  const [t] = await Promise.all([
    getTranslations("PaymentRequestError"),
    updateTransaction(
      props.searchParams.transactionId,
      props.searchParams.status
    ),
  ]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "2em",
      }}
    >
      <section style={{ width: "80%" }}>
        <h1 className='govie-heading-l'>{t('sorry')}</h1>
        <p className='govie-body'>{t('tryAgain')}</p>
        <Link href="/">
          <button className="govie-button govie-button--primary">
            {t("back")}
          </button>
        </Link>
      </section>
    </div>
  );
}
