import { handleSignIn } from "@logto/next/server-actions";
import { getBaseLogtoConfig } from "auth/authentication-context";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { getAuthenticationContextConfig } from "../logto_integration/config";

export async function GET(request: NextRequest) {
  const contextConfig = getAuthenticationContextConfig();

  await handleSignIn(
    {
      ...getBaseLogtoConfig(),
      ...contextConfig,
      resources: [contextConfig.resourceUrl],
    },
    request.nextUrl.searchParams,
  );

  redirect("/logto_integration");
}
