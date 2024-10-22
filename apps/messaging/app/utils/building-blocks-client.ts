import {
  BuildingBlocksSDK,
  default as getBuildingBlockSDK,
} from "@ogcio/building-blocks-sdk";
import { headers } from "next/headers";
import { streamToString } from "./messaging";
let buildingBlockSdk: BuildingBlocksSDK | undefined = undefined;

export const getSdks = () => {
  if (buildingBlockSdk) {
    return buildingBlockSdk;
  }

  buildingBlockSdk = getBuildingBlockSDK({
    services: {
      messaging: { baseUrl: process.env.MESSAGES_BACKEND_URL },
      profile: { baseUrl: process.env.PROFILE_BACKEND_URL },
    },
    getTokenFn: async (serviceName: string) => {
      if (serviceName === "messaging" || serviceName === "profile") {
        return invokeTokenApi(serviceName);
      }

      throw new Error(`Not valid service ${serviceName}`);
    },
  });

  return buildingBlockSdk;
};

const invokeTokenApi = async (
  serviceName: "messaging" | "profile",
): Promise<string> => {
  // call a route handler that retrieves the cached token
  // we need to forward the cookie header or the request won't be authenticated
  const cookieHeader = headers().get("cookie") as string;
  const serviceRoute =
    serviceName === "messaging" ? "/api/token" : "/api/profile-token";
  let responseClone: undefined | Response = undefined;
  try {
    const tokenUrl = new URL(
      serviceRoute,
      process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT as string,
    );
    // getCommonLoggerWithEnvLevel().trace(
    //   {
    //     tokenUrl: tokenUrl.toString(),
    //     hostname: tokenUrl.host,
    //     isCookieSet: cookieHeader?.length > 0,
    //   },
    //   "Invoking NextJs API to get token",
    // );
    const res = await fetch(tokenUrl, { headers: { cookie: cookieHeader } });
    responseClone = res.clone();
    const { token } = await res.json();
    return token;
  } catch (e) {
    let responseBody = "Response clone has not been set";
    let responseCode: number | undefined = undefined;
    if (responseClone && responseClone.body) {
      responseBody = await streamToString(responseClone.body);
      responseCode = responseClone.status;
    }
    // getCommonLoggerWithEnvLevel().error(
    //   { error: e, serviceRoute, responseCode, responseBody },
    //   "Error retrieving token from NextJs API",
    // );

    throw e;
  }
};
