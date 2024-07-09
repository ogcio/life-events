import { FastifyInstance } from "fastify";
import { createHmac } from "node:crypto";
import { createUser } from "../../services/users/create-user";
import { getUser } from "../../services/users/find-user";

const MY_GOV_ID_IDENTITY = "MyGovId (MyGovId connector)";

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
      switch (body.event) {
        case "User.Data.Updated":
        case "User.Created":
          //qui voglio fare upsert
          break;
      }

      const identities = body.data.identities;
      //const identities = body.user.identities;

      console.log({
        body,
        identities: identities["MyGovId (MyGovId connector)"].details.rawData,
      });
      /*
     {
[0] [8]   body: {
[0] [8]     event: 'User.Data.Updated',
[0] [8]     createdAt: '2024-07-09T14:22:31.607Z',
[0] [8]     userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
[0] [8]     ip: '::1',
[0] [8]     path: '/users/8esvldgdizmb',
[0] [8]     method: 'PATCH',
[0] [8]     status: 200,
[0] [8]     params: { userId: '8esvldgdizmb' },
[0] [8]     matchedRoute: '/users/:userId',
[0] [8]     data: {
[0] [8]       id: '8esvldgdizmb',
[0] [8]       username: null,
[0] [8]       primaryEmail: 'tony.stark@mail.ie',
[0] [8]       primaryPhone: '353729139412',
[0] [8]       name: 'Tony Stark',
[0] [8]       avatar: null,
[0] [8]       customData: {},
[0] [8]       identities: [Object],
[0] [8]       lastSignInAt: 1720534837329,
[0] [8]       createdAt: 1720534768543,
[0] [8]       updatedAt: 1720534951599,
[0] [8]       profile: {},
[0] [8]       applicationId: '4695d8onfb9f3bv18phtq',
[0] [8]       isSuspended: false
[0] [8]     },
[0] [8]     hookId: 'login-webhook'
[0] [8]   },
[0] [8]   identities: {
[0] [8]     'MyGovId (MyGovId connector)': { userId: '7ffe40ff7d558de01c54', details: [Object] }
[0] [8]   }
identities: {
[0] [8]     userId: '7ffe40ff7d558de01c54',
[0] [8]     details: {
[0] [8]       id: '7ffe40ff7d558de01c54',
[0] [8]       name: 'Tony Stark',
[0] [8]       email: 'tony.stark@mail.ie',
[0] [8]       phone: '+3537291394882',
[0] [8]       rawData: [Object]
[0] [8]     }
[0] [8]   }
[0] [8] }

identities: {
[0] [8]     aud: 'mock_client_id',
[0] [8]     exp: 1720541968,
[0] [8]     iat: 1720534768,
[0] [8]     iss: 'http://localhost:4005',
[0] [8]     nbf: 1716804749,
[0] [8]     oid: '71848ec91433bc4222d0',
[0] [8]     sub: '7ffe40ff7d558de01c54',
[0] [8]     ver: '1.0',
[0] [8]     email: 'tony.stark@mail.ie',
[0] [8]     mobile: '+3537291394882',
[0] [8]     surname: 'Stark',
[0] [8]     lastName: 'Stark',
[0] [8]     BirthDate: '13/06/1941',
[0] [8]     auth_time: 1720534768109,
[0] [8]     firstName: 'Tony',
[0] [8]     givenName: 'Tony',
[0] [8]     CustomerId: '532',
[0] [8]     LastJourney: 'Login',
[0] [8]     AlternateIds: '',
[0] [8]     CorrelationId: 'cd8cecf5b831a28944af8cc62b5da5761a96be29',
[0] [8]     SMS2FAEnabled: false,
[0] [8]     DSPOnlineLevel: '0',
[0] [8]     currentCulture: 'en',
[0] [8]     PublicServiceNumber: '0111019P',
[0] [8]     AcceptedPrivacyTerms: true,
[0] [8]     DSPOnlineLevelStatic: '0',
[0] [8]     trustFrameworkPolicy: 'B2C_1A_MyGovID_signin-v5-PARTIAL2',
[0] [8]     AcceptedPrivacyTermsDateTime: 1715582120,
[0] [8]     AcceptedPrivacyTermsVersionNumber: '7'
[0] [8]   }
[0] [8] }
[0] [8] [16:24:56.292] INFO:
[0] [8]     level_name: "INFO"
[0] [8]     request_id: "g362nTGsTkmpYiqB7xy4Og-0000000000"
[0] [8]     request: {
[0] [8]       "scheme": "http",
      */

      // // const firstIdentity = Object.keys(identities)[0];
      // // const identityData = identities[firstIdentity];

      // //TODO: Evaluate what fields to save
      // console.log("Raw identity data:", identityData.details.rawData);

      return { status: "ok" };
    },
  );
}
