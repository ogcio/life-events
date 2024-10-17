import { NextResponse } from "next/server";
import { ProfileAuthenticationFactory } from "../../../libraries/profile-authentication-factory";

// retrieve the token in a route handler so Logto can cache the token by setting the cookie
export async function GET(request) {
  const orgId = request.nextUrl.searchParams.get("organizationId");
  const token =
    await ProfileAuthenticationFactory.getInstance(orgId).getToken();

  return NextResponse.json({ token });
}
