import { signOut } from "@logto/next/server-actions";
import { logtoConfig } from "../../../../libraries/logtoConfig";

export async function GET() {
  await signOut(logtoConfig, process.env.HOST_URL);
}
