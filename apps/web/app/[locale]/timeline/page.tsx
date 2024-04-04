import { PgSessions } from "auth/sessions";
import { web } from "../../utils";
import Timeline from "./Timeline";

export default async (props: web.NextPageProps) => {
  const { firstName, lastName } = await PgSessions.get();

  const userName = [firstName, lastName].join(" ");

  return (
    <div
      style={{
        display: "flex",
        margin: "1.3rem 0",
        gap: "2.5rem",
      }}
    >
      <Timeline userName={userName} searchParams={props.searchParams} />
    </div>
  );
};
