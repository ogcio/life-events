import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  NextPageProps,
  RenewDriversLicenceFlow,
} from "../[event]/[...action]/types";
import RejectReasonForm from "./RejectReasonForm";
import RenewLicenceUserDetails from "./RenewLicenceUserDetails";
import { pgpool } from "../../dbConnection";

export default async (props: NextPageProps) => {
  const t = await getTranslations("Admin.EventsTable");
  const userFlows = await pgpool.query(`
    SELECT 
        u.id, 
        u.user_name, 
        fd.flow,
        fd.flow_data    
    FROM user_flow_data fd
    JOIN users u on u.id = fd.user_id and u.is_public_servant = false
    WHERE (fd.flow_data -> 'paymentId')::jsonb ? '' IS false
  `);

  if (props.searchParams && Object.keys(props.searchParams).length) {
    const item = userFlows.rows.find(
      (row) =>
        row.id === props.searchParams?.uid &&
        props.searchParams?.evt === row.flow
    );

    if (!item) {
      return (
        <>
          <h1>{t("eventNotFound")}</h1>
          <Link className="govie-back-link" href="/admin">
            {t("back")}
          </Link>
        </>
      );
    }

    const {
      userName,
      currentAddress,
      currentAddressVerified,
      sex,
      mobile,
      email,
      proofOfAddressRequest,
      totalFeePaid,
      dateOfPayment,
    }: RenewDriversLicenceFlow = item.flow_data;

    const searchParamsWithRejectionOpen = new URLSearchParams(
      props.searchParams
    );
    searchParamsWithRejectionOpen.append("open", "rejection");
    return (
      <>
        {props.searchParams.open === "rejection" && (
          <RejectReasonForm
            flow={item.flow}
            params={props.params}
            userId={item.id}
            searchParams={props.searchParams}
          />
        )}
        <RenewLicenceUserDetails
          currentAddress={currentAddress}
          currentAddressVerified={Boolean(currentAddressVerified)}
          dateOfPayment={dateOfPayment}
          email={email}
          flow={item.flow}
          hideFormButtons={Boolean(item.flow_data.successfulAt)}
          mobile={mobile}
          params={props.params}
          proofOfAddress={proofOfAddressRequest}
          sex={sex}
          totalFeePaid={totalFeePaid}
          userId={item.id}
          userName={userName}
          searchParams={props.searchParams}
        />

        <Link className="govie-back-link" href="/admin">
          {t("back")}
        </Link>
      </>
    );
  }

  const status = (flowData: RenewDriversLicenceFlow) => {
    console.log(flowData);
    if (flowData.successfulAt) {
      return "Approved";
    }

    if (flowData.rejectReason) {
      return "Rejected";
    }

    return "Pending";
  };

  return (
    <>
      <h1>{t("title")}</h1>
      <table className="govie-table">
        <thead className="govie-table__head">
          <tr className="govie-table__row">
            <th scope="col" className="govie-table__header">
              {t("nameColumn")}
            </th>
            <th scope="col" className="govie-table__header">
              {t("typeColumn")}
            </th>
            <th scope="col" className="govie-table__header">
              {t("statusColumn")}
            </th>
            <th scope="col" className="govie-table__header">
              {t("actionColumn")}
            </th>
          </tr>
        </thead>
        <tbody className="govie-table__body">
          {userFlows.rows.map((row) => {
            return (
              <tr key={row.id} className="govie-table__row">
                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  {row.flow_data.userName}
                </td>

                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  {t(row.flow)}
                </td>

                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  {status(row.flow_data)}
                </td>

                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  <div>
                    <div>
                      <Link
                        className="govie-link govie-!-margin-right-3"
                        href={`?uid=${row.id}&evt=${row.flow}`}
                      >
                        {t("view")}
                      </Link>
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};
