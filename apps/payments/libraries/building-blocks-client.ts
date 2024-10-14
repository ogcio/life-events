import {
  BuildingBlocksSDK,
  default as getBuildingBlockSDK,
} from "@ogcio/building-blocks-sdk";
import { headers } from "next/headers";
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
      if (serviceName === "payments") {
        return invokeTokenApi();
      }

      throw new Error(`Not valid service ${serviceName}`);
    },
  });

  return buildingBlockSdk;
};

const invokeTokenApi = async (): Promise<string> => {
  // call a route handler that retrieves the cached token
  // we need to forward the cookie header or the request won't be authenticated
  const cookieHeader = headers().get("cookie") as string;

  const res = await fetch(
    new URL(
      "/api/token",
      process.env.NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT as string,
    ),
    { headers: { cookie: cookieHeader } },
  );
  const { token } = await res.json();
  return token;
};
