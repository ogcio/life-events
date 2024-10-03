import { handleSignIn } from "@logto/next/server-actions";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { getSignInConfiguration } from "../../../utils/authentication-factory";

export async function GET(request: NextRequest) {
  console.log(getSignInConfiguration());
  await handleSignIn(getSignInConfiguration(), request.nextUrl.searchParams);

  redirect("/");
}
