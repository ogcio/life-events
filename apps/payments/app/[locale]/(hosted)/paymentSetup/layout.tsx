import PaymentsMenu from "./PaymentsMenu";
import { notFound } from "next/navigation";
import { getPaymentsCitizenContext } from "../../../../libraries/auth";

export default async ({ children, params: { locale } }) => {
  const { isPublicServant } = await getPaymentsCitizenContext();
  if (!isPublicServant) return notFound();

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
