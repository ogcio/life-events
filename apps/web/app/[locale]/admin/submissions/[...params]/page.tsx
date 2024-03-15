import { notFound } from "next/navigation";
import { workflow } from "../../../../utils";
import { pgpool } from "../../../../utils/postgres";
import OrderEHICUserDetails from "./OrderEHICUserDetails";
import RejectReasonForm from "./RejectReasonForm";
import RenewLicenceUserDetails from "./RenewLicenceUserDetails";
import OrderBirthCertificateUserDetails from "./OrderBirthCertificateUserDetails";

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

export default async (props: { params: { params: string[] } }) => {
  const [flow, userId, action] = props.params.params;

  if (!flow || !userId) {
    return <h1>Invalid path</h1>;
  }

  let data: workflow.Workflow | undefined;
  let isDbError = false;
  try {
    const queryResult = await pgpool.query<{ data: workflow.Workflow }>(
      `
      SELECT flow_data as "data" FROM user_flow_data
      WHERE user_id = $1 
      AND flow = $2 
      AND ("flow_data" ->> 'rejectReason') = ''
      AND ("flow_data" ->> 'successfulAt') = ''
      AND ("flow_data" ->> 'paymentId') IS NULL
      `,
      [userId, flow],
    );
    data = queryResult.rows.at(0)?.data;
  } catch (err) {
    console.log(err);
    isDbError = true;
  }

  if (isDbError) {
    return <h1>Server error</h1>;
  }

  if (!data) {
    return <h1>Not found</h1>;
  }

  if (action === "reject") {
    return <RejectReasonForm flow={flow} userId={userId} />;
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

  throw notFound();
};
