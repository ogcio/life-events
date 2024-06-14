import { signIn } from "@logto/next/server-actions";
import logtoConfig from "../config";

export async function GET() {
  await signIn(logtoConfig);
}
