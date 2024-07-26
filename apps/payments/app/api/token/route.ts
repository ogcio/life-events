import { NextResponse } from "next/server";
import { AuthenticationFactory } from "../../../libraries/authentication-factory";
import { paymentsApiResource } from "../../../libraries/logtoConfig";

export async function GET() {
  const token =
    await AuthenticationFactory.getInstance().getToken(paymentsApiResource);

  return NextResponse.json({ token });
}
