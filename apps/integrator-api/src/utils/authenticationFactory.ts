import { getAccessToken } from "api-auth";
import { Messaging } from "building-blocks-sdk";

const getMessagingBaseConfig = (): {
  logtoOidcEndpoint: string;
  applicationId: string;
  applicationSecret: string;
} => ({
  logtoOidcEndpoint: process.env.LOGTO_OIDC_ENDPOINT ?? "",
  applicationId: process.env.LOGTO_M2M_MESSAGING_APP_ID ?? "",
  applicationSecret: process.env.LOGTO_M2M_MESSAGING_APP_SECRET ?? "",
});

const getMessagingToken = (): Promise<string> =>
  getAccessToken({
    ...getMessagingBaseConfig(),
    scopes: ["messaging:message:write"],
    resource: `${process.env.MESSAGES_BACKEND_URL}/`,
  });

export const getMessagingSdk = async (): Promise<Messaging> => {
  const token = await getMessagingToken();
  console.log(">>>", token);
  return new Messaging(token);
};
