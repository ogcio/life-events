import { handleSignIn } from "@logto/next/server-actions";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { getSignInConfiguration } from "../../../utils/logto-config";

export async function GET(request: NextRequest) {
  await handleSignIn(getSignInConfiguration(), request.nextUrl.searchParams);

  redirect("/");
}
