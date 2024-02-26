import { PgSessions, pgpool } from "../../../../sessions";

export default async () => {
  const { userId } = await PgSessions.get();

  const x = await pgpool.query(
    `
      INSERT INTO payment_providers (user_id, provider_name, provider_type, status)
      VALUES ($1, $2, $3, $4)
    `,
    [userId, "Example provider", "stripe", "connected"]
  );

  return (
    <p>Add account</p>
  )
}
