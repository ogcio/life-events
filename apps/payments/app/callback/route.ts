import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { handleSignIn } from "../../libraries/logto";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  await handleSignIn(searchParams);

  redirect("/");
}
