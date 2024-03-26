import { cookies } from "next/headers";
import { decodeJwt, pgpool, PgSessions } from "./sessions";
import { redirect, RedirectType } from "next/navigation";

export default async function (req: Request) {
  const formData = await req.formData();
  const token = formData.get("id_token")?.toString() ?? "";
  const password = formData.get("password");
  const isPublicServant = Boolean(formData.get("public_servant"));

  const loginUrl = process.env.LOGIN_URL;


  if (!loginUrl) {
    throw Error("Missing env var LOGIN_URL");
  }

  if (!token || password !== "123") {
    redirect(loginUrl, RedirectType.replace);
  }

  // Note, this is purely conceptual. There's no signing at this time. Read description of jose.decodeJwt for further info once we're at that stage.
  const { email, firstName, lastName } = decodeJwt(token);

  const q = await pgpool.query(
    `
    WITH get AS (
      SELECT id, is_public_servant FROM users WHERE govid_email=$1
    ), insert_new AS (
      INSERT INTO users(govid_email, govid, user_name, is_public_servant)
      values($1, $2, $3, $4)
      ON CONFLICT DO NOTHING
      RETURNING id, is_public_servant
    )
    SELECT * FROM get UNION SELECT * FROM insert_new`,
    [email, "not needed atm", [firstName, lastName].join(" "), isPublicServant],
  );

  const [{ id, is_public_servant }] = q.rows;

  const ssid = await PgSessions.set({
    token,
    userId: id,
  });

  cookies().set({
    name: "sessionId",
    value: ssid,
    httpOnly: true,
    secure: false, // Set to true with https
    path: "/",
    sameSite: "lax", // Set to none with https
  });

  if (is_public_servant) {
    return redirect("/admin", RedirectType.replace);
  }

  redirect("/", RedirectType.replace);
}
