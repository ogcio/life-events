import { signIn } from "@logto/next/server-actions";
import { logtoConfig } from "../../../../libraries/logtoConfig";

export async function GET(request: Request) {
  await signIn(logtoConfig);
}
