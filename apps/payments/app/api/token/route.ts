import { NextResponse } from "next/server";
import { AuthenticationFactory } from "../../../libraries/authentication-factory";

// retrieve the token in a route handler so Logto can cache the token by setting the cookie
export async function GET() {
  const token = await AuthenticationFactory.getInstance().getToken();

  return NextResponse.json({ token });
}
