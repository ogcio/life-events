import { signOut } from "@logto/next/server-actions";
import logtoConfig, { postSignoutRedirect } from "../config";

export async function GET() {
  await signOut(logtoConfig, postSignoutRedirect);
}
