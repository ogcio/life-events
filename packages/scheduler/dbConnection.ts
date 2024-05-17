import { Pool } from "pg";

export const pgpool = new Pool({
  host: process.env.POSTGRES_SCHEDULER_HOST,
  port: Number(process.env.POSTGRES_SCHEDULER_PORT),
  user: process.env.POSTGRES_SCHEDULER_USER,
  password: process.env.POSTGRES_SCHEDULER_PASSWORD,
  database: process.env.POSTGRES_SCHEDULER_DB_NAME,
});
