import {
  BuildingBlocksSDK,
  default as getBuildingBlockSDK,
} from "@ogcio/building-blocks-sdk";
import {
  UPLOAD,
  PROFILE,
  SERVICE_NAME,
} from "@ogcio/building-blocks-sdk/dist/types";
import { headers } from "next/headers";

let buildingBlockSdk: BuildingBlocksSDK | undefined = undefined;

export const getSdks = () => {
  if (buildingBlockSdk) {
    return buildingBlockSdk;
  }

  console.log({
    services: {
      upload: { baseUrl: process.env.UPLOAD_BACKEND_URL },
      profile: { baseUrl: process.env.PROFILE_BACKEND_URL },
    },
    getTokenFn: async (serviceName: string) => {
      if (serviceName === UPLOAD || serviceName === PROFILE) {
        return invokeTokenApi(serviceName);
      }

      throw new Error(`No valid service ${serviceName}`);
    },
  });

  buildingBlockSdk = getBuildingBlockSDK({
    services: {
      upload: { baseUrl: process.env.UPLOAD_BACKEND_URL },
      profile: { baseUrl: process.env.PROFILE_BACKEND_URL },
    },
    getTokenFn: async (serviceName: string) => {
      if (serviceName === UPLOAD || serviceName === PROFILE) {
        return invokeTokenApi(serviceName);
      }

      throw new Error(`No valid service ${serviceName}`);
    },
  });

  return buildingBlockSdk;
};

const invokeTokenApi = async (serviceName: SERVICE_NAME): Promise<string> => {
  // call a route handler that retrieves the cached token
  // we need to forward the cookie header or the request won't be authenticated
  const cookieHeader = headers().get("cookie") as string;

  const res = await fetch(
    new URL(
      serviceName === UPLOAD ? "/api/token" : "/api/profile-token",
      process.env.NEXT_PUBLIC_UPLOAD_SERVICE_ENTRY_POINT as string,
    ),
    { headers: { cookie: cookieHeader } },
  );
  let token = "";
  let responseClone: undefined | Response = undefined;

  try {
    console.log({ res });

    responseClone = res.clone();

    ({ token } = await res.json());
  } catch (err) {
    let responseBody = "Response clone has not been set";
    let responseCode: number | undefined = undefined;
    if (responseClone && responseClone.body) {
      responseBody = await streamToString(responseClone.body);
      responseCode = responseClone.status;
    }
    console.log({ responseBody, responseCode });
  }
  return token || "";
};

const streamToString = async (
  stream: ReadableStream<Uint8Array>,
): Promise<string> => {
  const reader = stream.getReader();
  const textDecoder = new TextDecoder();
  let result = "";

  async function read() {
    const { done, value } = await reader.read();

    if (done) {
      return result;
    }

    result += textDecoder.decode(value, { stream: true });
    return read();
  }

  return read();
};
