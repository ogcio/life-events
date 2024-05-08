import { notFound } from "next/navigation";
import { workflow } from "../../../../utils";
import { pgpool } from "../../../../utils/postgres";
import OrderEHICUserDetails from "./OrderEHICUserDetails";
import RejectReasonForm from "./RejectReasonForm";
import RenewLicenceUserDetails from "./RenewLicenceUserDetails";
import OrderBirthCertificateUserDetails from "./OrderBirthCertificateUserDetails";
import NotifyDeathDetails from "./NotifyDeathDetails";
import ApplyJobseekersAllowanceDetails from "./ApplyJobseekersAllowanceDetails";
import GetDigitalWalletDetails from "./GetDigitalWalletDetails";
import NewRejectReasonForm from "./NewRejectReasonForm";

const isOrderEHICData = (
  flow: string,
  flowData: workflow.Workflow,
): flowData is workflow.OrderEHIC => flow === workflow.keys.orderEHIC;

const isRenewDriversLicenceData = (
  flow: string,
  flowData: workflow.Workflow,
): flowData is workflow.RenewDriversLicence =>
  flow === workflow.keys.renewDriversLicence;

const isOrderBirthCertificateData = (
  flow: string,
  flowData: workflow.Workflow,
): flowData is workflow.OrderBirthCertificate =>
  flow === workflow.keys.orderBirthCertificate;

const isNotifyDeatheData = (
  flow: string,
  flowData: workflow.Workflow,
): flowData is workflow.NotifyDeath => flow === workflow.keys.notifyDeath;

const isApplyJobseekersAllowanceData = (
  flow: string,
  flowData: workflow.Workflow,
): flowData is workflow.ApplyJobseekersAllowance =>
  flow === workflow.keys.applyJobseekersAllowance;

const isGetDigitalWalletData = (
  flow: string,
  flowData: workflow.Workflow,
): flowData is workflow.GetDigitalWallet =>
  flow === workflow.keys.getDigitalWallet;

export default async (props: {
  searchParams: { action: string };
  params: { params: string[] };
}) => {
  const [flow, userId, redirectPath] = props.params.params;
  const { action } = props.searchParams;

  if (!flow || !userId) {
    throw notFound();
  }

  let data: workflow.Workflow | undefined;

  try {
    const queryResult = await pgpool.query<{ data: workflow.Workflow }>(
      `
      SELECT flow_data as "data" FROM user_flow_data
      WHERE user_id = $1 
      AND flow = $2 
      AND ("flow_data" ->> 'submittedAt') != ''
      `,
      [userId, flow],
    );
    data = queryResult.rows.at(0)?.data;
  } catch (err) {
    console.log(err);
    throw new Error("Could not get flow data");
  }

  if (!data) {
    throw notFound();
  }

  if (redirectPath === "reject") {
    return <RejectReasonForm flow={flow} userId={userId} />;
  }

  if (redirectPath === "reject-new") {
    return <NewRejectReasonForm flow={flow} userId={userId} />;
  }

  if (
    flow === workflow.keys.renewDriversLicence &&
    isRenewDriversLicenceData(flow, data)
  ) {
    return (
      <RenewLicenceUserDetails flow={flow} flowData={data} userId={userId} />
    );
  }

  if (flow === workflow.keys.orderEHIC && isOrderEHICData(flow, data)) {
    return <OrderEHICUserDetails flow={flow} flowData={data} userId={userId} />;
  }

  if (
    flow === workflow.keys.orderBirthCertificate &&
    isOrderBirthCertificateData(flow, data)
  ) {
    return (
      <OrderBirthCertificateUserDetails
        flow={flow}
        flowData={data}
        userId={userId}
      />
    );
  }

  if (flow === workflow.keys.notifyDeath && isNotifyDeatheData(flow, data)) {
    return <NotifyDeathDetails flow={flow} flowData={data} userId={userId} />;
  }

  if (
    flow === workflow.keys.applyJobseekersAllowance &&
    isApplyJobseekersAllowanceData(flow, data)
  ) {
    return (
      <ApplyJobseekersAllowanceDetails
        flow={flow}
        flowData={data}
        userId={userId}
      />
    );
  }

  if (
    flow === workflow.keys.getDigitalWallet &&
    isGetDigitalWalletData(flow, data)
  ) {
    return (
      <GetDigitalWalletDetails
        flow={flow}
        flowData={data}
        userId={userId}
        action={action}
      />
    );
  }

  throw notFound();
};
