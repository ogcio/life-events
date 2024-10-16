import {
  BuildingBlocksSDK,
  default as getBuildingBlockSDK,
} from "@ogcio/building-blocks-sdk";
import { headers } from "next/headers";
import { getCommonLoggerWithEnvLevel } from "./messaging";
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
  try {
    const res = await fetch(
      new URL(
        serviceRoute,
        process.env.NEXT_PUBLIC_MESSAGING_SERVICE_ENTRY_POINT as string,
      ),
      { headers: { cookie: cookieHeader } },
    );
    const { token } = await res.json();
    return token;
  } catch (e) {
    getCommonLoggerWithEnvLevel().error(
      { error: e, serviceRoute },
      "Error retrieving token from NextJs API",
    );

    throw e;
  }
};
