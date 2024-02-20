import { cookies } from "next/headers";
import { pgpool, PgSessions } from "../../../sessions";
import { redirect, RedirectType } from "next/navigation";

export async function POST(req: Request) {
  const formData = await req.formData();
  const token = formData.get("id_token")?.toString() ?? "";
  const password = formData.get("password");

  if (!token || password !== "123") {
    redirect("http://mock-api.localtest.me/login/", RedirectType.replace);
  }

  // Note, this is purely conceptual. There's no signing at this time. Read description of jose.decodeJwt for further info once we're at that stage.
  const { email, firstName, lastName } = PgSessions.utils.decodeJwt(token);

  const q = await pgpool.query(
    `
    WITH get AS (
      SELECT id FROM users WHERE govid_email=$1
    ), insert_new AS (
      INSERT INTO users(govid_email, govid, user_name)
      values($1, $2, $3)
      ON CONFLICT DO NOTHING
      RETURNING id
    )
    SELECT * FROM get UNION SELECT * FROM insert_new`,
    [email, "not needed atm", [firstName, lastName].join(" ")]
  );

  const [{ id }] = q.rows;

  const ssid = await PgSessions.set(
    {
      token,
    },
    id
  );

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
