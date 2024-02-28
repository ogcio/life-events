import { useTranslations } from "next-intl";
import Link from "next/link";
import { redirect } from "next/navigation";
import { pgpool } from "../../dbConnection";
import { ListRow } from "../[event]/[...action]/RenewDriversLicence/CheckYourDetails";
import { NextPageProps } from "../[event]/[...action]/types";

type Props = NextPageProps & {
  userName: string;
  flow: string;
  sex: string;
  currentAddress: string;
  currentAddressVerified: boolean;
  proofOfAddress: string;
  mobile: string;
  email: string;
  hideFormButtons: boolean;
  userId: string;
  totalFeePaid: string;
  dateOfPayment: string;
};

export default ({
  userId,
  hideFormButtons,
  userName,
  flow,
  sex,
  currentAddress,
  currentAddressVerified,
  proofOfAddress,
  email,
  mobile,
  dateOfPayment,
  totalFeePaid,
  searchParams,
}: Props) => {
  const t = useTranslations("Admin.RenewLicenceUserDetails");
  async function approveAction(formData: FormData) {
    "use server";
    const userId = formData.get("userId");
    const flow = formData.get("flow");

    await pgpool.query(
      `
            UPDATE user_flow_data set flow_data = flow_data || jsonb_build_object('successfulAt', now()::DATE::TEXT)
            WHERE user_id=$1 AND flow = $2
        `,
      [userId, flow]
    );

    redirect("/admin");
  }

  const searchParamsWithRejectionOpen = new URLSearchParams(searchParams);
  searchParamsWithRejectionOpen.append("open", "rejection");

  return (
    <>
      <div className="govie-heading-l">
        {t("title", { flow: t(flow).toLowerCase() })}
      </div>
      <div className="govie-heading-m">{userName}</div>
      <div className="govie-grid-row">
        <div className="govie-grid-column-two-thirds-from-desktop">
          <dl className="govie-summary-list">
            <ListRow item={{ key: t("name"), value: userName }} />
            <ListRow item={{ key: t("sex"), value: sex }} />
            <ListRow
              item={{
                key: t("address"),
                value: currentAddress,
              }}
            />
            <ListRow
              item={{
                key: t("addressVerified"),
                value: currentAddressVerified ? t("yes") : t("no"),
              }}
            />
            <ListRow
              item={{ key: t("proofOfAddress"), value: proofOfAddress }}
            />
            <ListRow item={{ key: t("mobile"), value: mobile }} />
            <ListRow item={{ key: t("email"), value: email }} />
            <ListRow
              item={{ key: t("totalPaid"), value: `€${totalFeePaid}` }}
            />
            <ListRow item={{ key: t("payDate"), value: dateOfPayment }} />
          </dl>
        </div>
      </div>
      {hideFormButtons ? null : (
        <form
          action={approveAction}
          style={{ display: "flex", alignItems: "baseline", gap: "20px" }}
        >
          <input type="hidden" name="userId" defaultValue={userId} />
          <input type="hidden" name="flow" defaultValue={flow} />
          <Link
            className="govie-link"
            href={"?" + searchParamsWithRejectionOpen.toString()}
          >
            {t("reject")}
          </Link>
          <button type="submit" className="govie-button govie-button--medium">
            {t("approve")}
          </button>
        </form>
      )}
    </>
  );
};
