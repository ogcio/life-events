import { signOut } from "@logto/next/server-actions";
import { logtoConfig, postSignoutRedirect } from "../page";

export async function GET() {
  await signOut(logtoConfig, postSignoutRedirect);
}
