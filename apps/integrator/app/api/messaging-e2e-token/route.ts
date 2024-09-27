import { NextResponse } from "next/server";

const logtoEndpoint = process.env.LOGTO_ENDPOINT || "";
const logtoResource = process.env.LOGTO_RESOURCE || "";
const applicationId = process.env.LOGTO_MESSAGING_E2E_APP_ID || "";
const applicationSecret = process.env.LOGTO_MESSAGING_E2E_APP_SECRET || "";

// retrieve the token in a route handler so Logto can cache the token by setting the cookie
export async function GET(request) {
  /// TODO: Invalid Compact JWS error must be fixed
  const result = await fetch(`${logtoEndpoint}oidc/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${applicationId}:${applicationSecret}`,
      ).toString("base64")}`,
    },
    body: JSON.stringify({
      bypassConsent: false,
      message: {
        grant_type: "client_credentials",
        resource: logtoResource,
        scope: "all",
      },
    }),
  });
  const accessToken = (await result.json()).access_token;
  return NextResponse.json({ token: accessToken });
}
