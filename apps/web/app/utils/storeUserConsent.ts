import { postgres } from ".";

const agreements = {
  storeUserData: "storeUserData",
};

export default async (userId: string, decision: string) => {
  await postgres.pgpool.query(
    `
      INSERT INTO user_consents(user_id, agreement, is_consenting)
      VALUES($1, $2, $3)
    `,
    [userId, agreements.storeUserData, decision === "agree"],
  );
};
