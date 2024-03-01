import dayjs from "dayjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import { appConstants } from "../../../../constants";
import { PgSessions } from "auth/sessions";
import { urlConstants } from "../../../../utils";
import ActionBreadcrumb from "../ActionBreadcrumb";
import {
  emptyRenewDriversLicenceFlow,
  NextPageProps,
  RenewDriversLicenceFlow,
} from "../types";
import AddressForm from "./AddressForm";
import ApplicationSuccess from "./ApplicationSuccess";
import CheckYourDetails from "./CheckYourDetails";
import DetailsSummary from "./DetailsSummary";
import MedicalForm from "./MedicalForm";
import PaymentPlaceholder from "./PaymentPlaceholder";
import PaymentSuccess from "./PaymentSuccess";
import ProofOfAddress from "./ProofOfAddress";
import SimpleDetailsForm from "./SimpleDetailsForm";
import { pgpool } from "../../../../dbConnection";

// move
type StepFn<TData> = (data: TData) => string | null;
// enhance further by providing steps eg. doesn't have to be hard coded specifically for this event action.
export function getNextSlug(data: RenewDriversLicenceFlow) {
  const steps: StepFn<RenewDriversLicenceFlow>[] = [
    (params) => {
      if (
        Boolean(
          params.currentAddress &&
            params.dayOfBirth &&
            params.monthOfBirth &&
            params.yearOfBirth &&
            params.email &&
            params.mobile &&
            params.userName &&
            params.sex &&
            params.timeAtAddress
        )
      ) {
        return null;
      }
      return urlConstants.slug.checkDetails;
    },
    ({ confirmedApplication }) =>
      !confirmedApplication ? urlConstants.slug.confirmApplication : null,
    ({ dayOfBirth, monthOfBirth, yearOfBirth, medicalCertificate }) => {
      const birthDay = dayjs(
        new Date(
          Number(yearOfBirth),
          Number(monthOfBirth) - 1,
          Number(dayOfBirth)
        )
      );
      const yearDiff = dayjs().diff(birthDay, "years", true);

      return yearDiff >= appConstants.driverLicenceMedicalFormAgeThreshold &&
        !medicalCertificate
        ? urlConstants.slug.medicalCertificate
        : null;
    },
    ({ dayOfBirth, monthOfBirth, yearOfBirth }) => {
      const birthDay = dayjs(
        new Date(
          Number(yearOfBirth),
          Number(monthOfBirth) - 1,
          Number(dayOfBirth)
        )
      );
      const yearDiff = dayjs().diff(birthDay, "years", true);

      return yearDiff >= appConstants.driverLicencePaymentAgeThreshold
        ? urlConstants.slug.applicationSuccess
        : null;
    },
    ({ paymentId }) => (!paymentId ? urlConstants.slug.paymentSelection : null),
    ({ paymentId }) => (paymentId ? urlConstants.slug.paymentSuccess : null),
    () => "success",
  ];

  return (
    steps.reduce((element, fn, _, arr) => {
      if (element) {
        arr.length = 0;
        return element;
      }
      return fn(data);
    }, null) || ""
  );
}

// move
export const renewDriversLicenceFlowKey = "renewDriversLicence";

function FormLayout(
  props: React.PropsWithChildren<{
    action: { slug: string; href?: string };
    step: string;
    backHref?: string;
  }>
) {
  return (
    <>
      <ActionBreadcrumb action={props.action} step={props.step} />
      {props.children}
      {props.backHref && (
        <Link href={props.backHref} className="govie-back-link">
          Back
        </Link>
      )}
    </>
  );
}

export default async (props: NextPageProps) => {
  // Session details
  const { userId, email, firstName, lastName } = await PgSessions.get();

  const flowQuery = pgpool.query<{ data: RenewDriversLicenceFlow }, [string]>(
    `
    SELECT 
        flow_data AS "data"
    FROM user_flow_data
    WHERE user_id=$1
    AND flow='renewDriversLicence'`,
    [userId]
  );

  const infoMedQuery = Promise.resolve([]);

  const [flowResult, infoMedResult] = await Promise.all([
    flowQuery,
    infoMedQuery,
  ]);

  const data: RenewDriversLicenceFlow = emptyRenewDriversLicenceFlow();

  // Set data from session?
  data.userName = [firstName, lastName].join(" ");
  data.email = email;

  for (const d of infoMedResult) {
    // map appropriately when we know more of this api
  }

  // Whatever data we keep in the flow state, always takes presidence
  if (flowResult.rowCount) {
    const [{ data: flowData }] = flowResult.rows;
    Object.assign(data, flowData);
  }

  const nextSlug = getNextSlug(data);

  // Act
  const stepSlug = props.params.action?.at(1);
  const actionSlug = props.params.action?.at(0) || ""; // should never ever be able to be empty at this point
  const baseActionHref = `/${props.params.locale}/driving/${actionSlug}/${nextSlug}`;

  switch (stepSlug) {
    case urlConstants.slug.applicationSuccess:
      return stepSlug === nextSlug ? (
        <FormLayout action={{ slug: actionSlug }} step={stepSlug}>
          <ApplicationSuccess flow={renewDriversLicenceFlowKey} />
        </FormLayout>
      ) : (
        redirect(nextSlug)
      );
    case urlConstants.slug.medicalCertificate:
      return stepSlug === nextSlug ? (
        <FormLayout
          action={{
            slug: actionSlug,
            href: baseActionHref,
          }}
          step={stepSlug}
          backHref={baseActionHref}
        >
          <MedicalForm
            flow={renewDriversLicenceFlowKey}
            userId={userId}
            params={props.params}
            searchParams={props.searchParams}
          />
        </FormLayout>
      ) : (
        redirect(nextSlug)
      );
    case urlConstants.slug.confirmApplication:
      return stepSlug === nextSlug ? (
        <FormLayout action={{ slug: actionSlug }} step={stepSlug}>
          <DetailsSummary
            userId={userId}
            sex={data.sex}
            userName={data.userName}
            email={data.email}
            mobile={data.mobile}
            currentAddress={data.currentAddress}
            dayOfBirth={data.dayOfBirth}
            monthOfBirth={data.monthOfBirth}
            timeAtAddress={data.timeAtAddress}
            yearOfBirth={data.yearOfBirth}
            flow={renewDriversLicenceFlowKey}
            proofOfAddressRequest={data.proofOfAddressRequest}
          />
        </FormLayout>
      ) : (
        redirect(nextSlug)
      );
    case urlConstants.slug.newAddress:
      return (
        <FormLayout
          action={{
            slug: actionSlug,
            href: baseActionHref,
          }}
          step={stepSlug}
          backHref={baseActionHref}
        >
          <AddressForm
            addressSearchQuery={props.searchParams?.adr}
            flow={renewDriversLicenceFlowKey}
            userId={userId}
            data={data}
          />
        </FormLayout>
      );
    case urlConstants.slug.changeDetails:
      return (
        <FormLayout
          action={{
            slug: actionSlug,
            href: baseActionHref,
          }}
          step={stepSlug}
          backHref={baseActionHref}
        >
          {/* @ts-expect-error Async Server Component */}
          <SimpleDetailsForm
            userId={userId}
            email={data.email}
            userName={data.userName}
            dayOfBirth={data.dayOfBirth}
            monthOfBirth={data.monthOfBirth}
            yearOfBirth={data.yearOfBirth}
            sex={data.sex}
            mobile={data.mobile}
            flow={renewDriversLicenceFlowKey}
            urlBase={`/${props.params.locale}/${props.params.event}/${actionSlug}`}
          />
        </FormLayout>
      );
    case urlConstants.slug.checkDetails:
      return (
        <FormLayout
          action={{ slug: actionSlug }}
          step={stepSlug}
          backHref="/driving"
        >
          <CheckYourDetails
            sex={data.sex}
            userName={data.userName}
            email={data.email}
            dateOfBirth={dayjs(
              `${data.yearOfBirth}-${data.monthOfBirth}-${data.dayOfBirth}`
            ).format("DD/MM/YYYY")}
            mobile={data.mobile}
            urlBase={`/${props.params.locale}/${props.params.event}/${actionSlug}`}
            currentAddress={data.currentAddress}
            timeAtAddress={data.timeAtAddress}
          />
        </FormLayout>
      );
    case urlConstants.slug.proofOfAddress:
      return (
        <FormLayout
          action={{
            slug: actionSlug,
            href: baseActionHref,
          }}
          step={stepSlug}
          backHref={baseActionHref}
        >
          {/* @ts-expect-error Async Server Component */}
          <ProofOfAddress
            step={props.searchParams?.step}
            flow={renewDriversLicenceFlowKey}
            userId={userId}
          />
        </FormLayout>
      );

    case urlConstants.slug.paymentSelection:
      return nextSlug === stepSlug ? (
        <FormLayout
          action={{ slug: actionSlug }}
          step={stepSlug}
          backHref={baseActionHref}
        >
          <PaymentPlaceholder
            flow={renewDriversLicenceFlowKey}
            userId={userId}
          />
        </FormLayout>
      ) : (
        redirect(nextSlug || "")
      );

    case urlConstants.slug.paymentSuccess:
      return nextSlug === stepSlug ? (
        <FormLayout action={{ slug: stepSlug }} step={stepSlug}>
          <PaymentSuccess
            dateOfPayment={data.dateOfPayment}
            totalFeePaid={data.totalFeePaid}
            flow={renewDriversLicenceFlowKey}
          />
        </FormLayout>
      ) : (
        redirect(nextSlug || "")
      );

    // This should never be hit, but if it does, it means it's a high chance of infinite redirects happened due to mistake.
    case urlConstants.slug.renewLicence:
      return (
        <>
          Handle missed case of infinite redirection. Error page with "go home"
          link maybe?
        </>
      );
  }

  return redirect(`${urlConstants.slug.renewLicence}/${nextSlug}`);
};
