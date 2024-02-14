import { cookies } from "next/headers";
import { PgSessions } from "../../../sessions";
import { redirect, RedirectType } from "next/navigation";

export async function POST(req) {
  const formData = await req.formData();

  const ssid = await PgSessions.set({
    token: formData.get("id_token"),
  });

  cookies().set({
    name: "sessionId",
    value: ssid,
    httpOnly: true,
    secure: false, // Set to true with https
    path: "/",
    sameSite: "lax", // Set to none with https
  });

  redirect("/", RedirectType.replace);
}
