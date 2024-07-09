import { FastifyInstance } from "fastify";
import { createHmac } from "node:crypto";
import { createUser } from "../../services/users/create-user";

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

      /*
      {
   body: {
     event: 'PostSignIn',
     interactionEvent: 'SignIn',
     createdAt: '2024-07-09T10:07:59.365Z',
     sessionId: 'cfHFHTzqmW-9LrwGeOeGd',
     userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
     userId: '5scmcwfknx79',
     userIp: '::1',
     user: {
       id: '5scmcwfknx79',
       username: null,
       primaryEmail: 'peter.parker@mail.ie',
       primaryPhone: '+3533680863205',
       name: 'Peter Parker',
       avatar: null,
       customData: {},
       identities: [Object],
       lastSignInAt: 1720519679359,
       createdAt: 1720426020084,
       updatedAt: 1720519679359,
       profile: {},
       applicationId: '4695d8onfb9f3bv18phtq',
       isSuspended: false
     },
     application: {
       id: '4695d8onfb9f3bv18phtq',
       type: 'Traditional',
       name: 'Messaging Building Block',
       description: 'Messaging App of Life Events'
     },
     hookId: 'login-webhook'
   }
 }
      */

      const firstIdentity = Object.keys(identities)[0];
      const identityData = identities[firstIdentity];

      //TODO: Evaluate what fields to save
      console.log("Raw identity data:", identityData.details.rawData);

      return { status: "ok" };
    },
  );
}
