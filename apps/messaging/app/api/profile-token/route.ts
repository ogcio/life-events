import { NextResponse } from "next/server";
import { ProfileAuthenticationFactory } from "../../utils/profile-authentication-factory";

// retrieve the token in a route handler so Logto can cache the token by setting the cookie
export async function GET() {
  const token = await ProfileAuthenticationFactory.getInstance().getToken();

  return NextResponse.json({ token });
}
