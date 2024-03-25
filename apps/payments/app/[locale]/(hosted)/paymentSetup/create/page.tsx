import { getTranslations } from "next-intl/server";
import { PgSessions } from "auth/sessions";
import { RedirectType, redirect } from "next/navigation";
import { pgpool } from "../../../../dbConnection";
import PaymentSetupForm from "../PaymentSetupForm";
import { stringToAmount } from "../../../../utils";

async function getRegisteredAccounts(userId: string, providerType: string) {
  "use server";

  const accountsQueryResult = await pgpool.query<
    { provider_id: string; provider_name: string },
    string[]
  >(
    `select provider_id, provider_name from payment_providers where user_id = $1 and provider_type = $2`,
    [userId, providerType],
  );

  if (!accountsQueryResult.rowCount) {
    return [];
  }

  return accountsQueryResult.rows;
}

async function createPayment(userId: string, formData: FormData) {
  "use server";

  const amount = stringToAmount(formData.get("amount")?.toString() as string);

  const openBankingAccount = formData.get("openbanking-account")?.toString();
  const bankTransferAccount = formData.get("banktransfer-account")?.toString();
  const stripeAccount = formData.get("stripe-account")?.toString();

  if (!openBankingAccount && !bankTransferAccount && !stripeAccount) {
    throw new Error("Failed to create payment");
  }

  const data = {
    title: formData.get("title")?.toString(),
    description: formData.get("description")?.toString(),
    reference: formData.get("reference")?.toString(),
    amount,
    redirectUrl: formData.get("redirect-url")?.toString(),
    allowAmountOverride: formData.get("allowAmountOverride") === "on",
    allowCustomAmount: formData.get("allowCustomAmount") === "on",
  };

  const client = await pgpool.connect();

  try {
    await client.query("BEGIN");
    const paymentRequestQueryResult = await pgpool.query<{
      payment_request_id: string;
    }>(
      `insert into payment_requests (user_id, title, description, reference, amount, redirect_url, status, allow_amount_override, allow_custom_amount)
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        returning payment_request_id`,
      [
        userId,
        data.title,
        data.description,
        data.reference,
        data.amount,
        data.redirectUrl,
        "pending",
        data.allowAmountOverride,
        data.allowCustomAmount,
      ],
    );

    if (!paymentRequestQueryResult.rowCount) {
      // handle creation failure
      throw new Error("Failed to create payment");
    }

    const paymentRequestId =
      paymentRequestQueryResult.rows[0].payment_request_id;

    if (openBankingAccount) {
      const paymentRequestProviderQueryResult = await pgpool.query<{
        payment_request_id: string;
      }>(
        `insert into payment_requests_providers (provider_id, payment_request_id)
        values ($1, $2)`,
        [openBankingAccount, paymentRequestId],
      );

      if (!paymentRequestProviderQueryResult.rowCount) {
        // handle creation failure
        throw new Error("Failed to create payment");
      }
    }

    if (bankTransferAccount) {
      const paymentRequestProviderQueryResult = await pgpool.query<{
        payment_request_id: string;
      }>(
        `insert into payment_requests_providers (provider_id, payment_request_id)
        values ($1, $2)`,
        [bankTransferAccount, paymentRequestId],
      );

      if (!paymentRequestProviderQueryResult.rowCount) {
        // handle creation failure
        throw new Error("Failed to create payment");
      }
    }

    if (stripeAccount) {
      const paymentRequestProviderQueryResult = await pgpool.query<{
        payment_request_id: string;
      }>(
        `insert into payment_requests_providers (provider_id, payment_request_id)
        values ($1, $2)`,
        [stripeAccount, paymentRequestId],
      );

      if (!paymentRequestProviderQueryResult.rowCount) {
        throw new Error("Failed to create payment");
      }
    }

    await client.query("COMMIT");

    redirect(
      `./requests/${paymentRequestQueryResult.rows[0].payment_request_id}`,
      RedirectType.replace,
    );
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export default async function Page() {
  const t = await getTranslations("PaymentSetup.CreatePayment");

  const { userId } = await PgSessions.get();

  const openBankingAccounts = await getRegisteredAccounts(
    userId,
    "openbanking",
  );

  const stripeAccounts = await getRegisteredAccounts(userId, "stripe");

  const manualBankTransferAccounts = await getRegisteredAccounts(
    userId,
    "banktransfer",
  );

  const submitPayment = createPayment.bind(this, userId);

  return <PaymentSetupForm userId={userId} action={submitPayment} />;
}
