import {
  BuildingBlocksSDK,
  default as getBuildingBlockSDK,
} from "@ogcio/building-blocks-sdk";
import { headers } from "next/headers";

let buildingBlockSdk: BuildingBlocksSDK | undefined = undefined;

export const getSdks = () => {
  // if (buildingBlockSdk) {
  //   return buildingBlockSdk;
  // }

  buildingBlockSdk = getBuildingBlockSDK({
    services: {
      upload: { baseUrl: process.env.UPLOAD_BACKEND_URL },
      profile: { baseUrl: process.env.PROFILE_BACKEND_URL },
    },
    getTokenFn: async (serviceName: string) => {
      return invokeTokenApi(serviceName);
    },
  });

  return buildingBlockSdk;
};

const invokeTokenApi = async (serviceName: string): Promise<string> => {
  // call a route handler that retrieves the cached token
  // we need to forward the cookie header or the request won't be authenticated
  const cookieHeader = headers().get("cookie") as string;

  const res = await fetch(
    new URL(
      "/api/token",
      process.env.NEXT_PUBLIC_UPLOAD_SERVICE_ENTRY_POINT as string,
    ),
    { headers: { cookie: cookieHeader } },
  );
  let token = "";
  let responseClone: undefined | Response = undefined;

  try {
    responseClone = res.clone();

    ({ token } = await res.json());
  } catch (err) {
    let responseBody = "Response clone has not been set";
    let responseCode: number | undefined = undefined;
    if (responseClone && responseClone.body) {
      responseBody = await streamToString(responseClone.body);
      responseCode = responseClone.status;
    }
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
