import { NextResponse } from "next/server";
import { AuthenticationFactory } from "../../../libraries/authentication-factory";

export async function GET() {
  const token = await AuthenticationFactory.getInstance().getToken();

  return NextResponse.json({ token });
}
