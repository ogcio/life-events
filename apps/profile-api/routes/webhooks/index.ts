import { FastifyInstance } from "fastify";
import { createHmac } from "node:crypto";

// https://docs.logto.io/docs/recipes/webhooks/securing-your-webhooks/
export const verifySignature = (
  signingKey: string,
  rawBody: Buffer,
  expectedSignature: string,
) => {
  const hmac = createHmac("sha256", signingKey);
  hmac.update(rawBody);
  const signature = hmac.digest("hex");
  return signature === expectedSignature;
};

export default async function webhooks(app: FastifyInstance) {
  app.post(
    "/user-login-wh",
    {
      config: {
        rawBody: true,
      },
    },
    async (req) => {
      const isSignatureVerified = verifySignature(
        process.env.LOGTO_WEBHOOK_SIGNING_KEY as string,
        req.rawBody as Buffer,
        req.headers["logto-signature-sha-256"] as string,
      );
      if (!isSignatureVerified) throw new Error("Signature not verified...");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body = req.body as any;
      const identities = body.user.identities;

      const firstIdentity = Object.keys(identities)[0];
      const identityData = identities[firstIdentity];

      //TODO: Evaluate what fields to save
      console.log("Raw identity data:", identityData.details.rawData);

      return { status: "ok" };
    },
  );
}
