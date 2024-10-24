import { Pool } from "pg";
import { seedProviders } from "./providers";
import { createUser } from "./users";
import { buildPgPool as buildAuthPool } from "auth/sessions";
import dotenv from "dotenv";
import { seedPaymentRequests } from "./request";
dotenv.config();

const pgpool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB_NAME,
});

const seed = async () => {
  const { rows: users } = await createUser(buildAuthPool());
  const userId = users[0].id;
  const [manualBankTransfer, openBanking, stripe, realex] = await seedProviders(
    pgpool,
    userId,
  );

  await seedPaymentRequests(pgpool, {
    openBankingProviderId: openBanking.rows[0].provider_id,
    manualBankTransferProviderId: manualBankTransfer.rows[0].provider_id,
    stripeProviderId: stripe.data!.id,
    realexProviderId: realex.data!.id,
    userId,
    description: "Description",
    reference: "1234",
    amount: 1000,
    redirectUrl: "https://www.google.com",
    allowAmountOverride: false,
    status: "active",
    allowCustomAmount: false,
  });
};

seed();
