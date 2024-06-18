import { PgSessions } from "auth/sessions";
import PaymentsMenu from "./PaymentsMenu";
import { notFound } from "next/navigation";

export default async ({ children, params: { locale } }) => {
  const { publicServant } = await PgSessions.get();
  if (!publicServant) return notFound();

  return (
    <div
      style={{
        display: "flex",
        marginTop: "1.3rem",
        gap: "2rem",
      }}
    >
      <PaymentsMenu locale={locale} />
      {children}
    </div>
  );
};
