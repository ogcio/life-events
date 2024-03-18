import { Pool } from "pg";
import { seedProviders } from "./providers";
import { createUser } from "./users";
import { buildPgPool as buildAuthPool } from "auth/sessions";
import dotenv from "dotenv";
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
  await seedProviders(pgpool, users[0].id);
};

seed();
