import { signIn } from "@logto/next/server-actions";
import { logtoConfig } from "../page";

export async function GET() {
  await signIn(logtoConfig);
}
