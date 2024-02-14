import { cookies } from "next/headers";
import Link from "next/link";
import { redirect, RedirectType } from "next/navigation";
import { PgSessions } from "../../../sessions";

export default async function ActionPage(props) {
  const sessionId = cookies().get("sessionId")?.value;
  if (!sessionId) {
    return redirect("/logout", RedirectType.replace);
  }

  const session = await PgSessions.get(sessionId);

  if (!session) {
    return redirect("/logout", RedirectType.replace);
  }

  return (
    <>
      <div className="govie-breadcrumbs">
        <ol className="govie-breadcrumbs__list">
          <li className="govie-breadcrumbs__list-item">
            <Link className="govie-breadcrumbs__link" href="/">
              Home
            </Link>
          </li>
          <li className="govie-breadcrumbs__list-item">
            <Link
              className="govie-breadcrumbs__link"
              href={"/" + props.params.event}
            >
              {props.params.event}
            </Link>
          </li>
          <li className="govie-breadcrumbs__list-item">
            <span className="govie-breadcrumbs__link">
              {props.params.action}
            </span>
          </li>
        </ol>
      </div>

      <div>{JSON.stringify(props, null, 4)}</div>

      <Link replace href={"/" + props.params.event} className="govie-back-link">
        Back
      </Link>
    </>
  );
}
