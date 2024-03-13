import dayjs from "dayjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PgSessions } from "auth/sessions";
import { routes, workflow, postgres, web } from "../../../../utils";
import ActionBreadcrumb from "../ActionBreadcrumb";
import AddressForm from "./AddressForm";
import ApplicationSuccess from "./ApplicationSuccess";
import DetailsSummary from "./DetailsSummary";
import MedicalForm from "./MedicalForm";
import PaymentPlaceholder from "./PaymentPlaceholder";
import ProofOfAddress from "./ProofOfAddress";
import SimpleDetailsForm from "./SimpleDetailsForm";
import PaymentSuccess from "./PaymentSuccess";
import PaymentError from "./PaymentError";

export const renewDriverLicenceRules: Parameters<
  typeof workflow.getCurrentStep<workflow.RenewDriversLicence>
>[0] = [
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
          params.timeAtAddress,
      )
    ) {
      return { key: null, isStepValid: true };
    }
    return {
      key: routes.driving.renewLicense.confirmApplication.slug,
      isStepValid: false,
    };
  },
  ({ confirmedApplication }) =>
    !confirmedApplication
      ? {
          key: routes.driving.renewLicense.confirmApplication.slug,
          isStepValid: true,
        }
      : { key: null, isStepValid: true },
  ({ dayOfBirth, monthOfBirth, yearOfBirth, medicalCertificate }) => {
    const birthDay = dayjs(
      new Date(
        Number(yearOfBirth),
        Number(monthOfBirth) - 1,
        Number(dayOfBirth),
      ),
    );
    const yearDiff = dayjs().diff(birthDay, "years", true);

    return yearDiff >= web.drivers.licenceMedicalFormAgeThreshold &&
      !medicalCertificate
      ? {
          key: routes.driving.renewLicense.medicalCertificate.slug,
          isStepValid: true,
        }
      : { key: null, isStepValid: true };
  },
  ({ dayOfBirth, monthOfBirth, yearOfBirth }) => {
    const birthDay = dayjs(
      new Date(
        Number(yearOfBirth),
        Number(monthOfBirth) - 1,
        Number(dayOfBirth),
      ),
    );
    const yearDiff = dayjs().diff(birthDay, "years", true);

    return yearDiff >= web.drivers.licencePaymentAgeThreshold
      ? {
          key: routes.driving.renewLicense.applicationSuccess.slug,
          isStepValid: true,
        }
      : { key: null, isStepValid: false };
  },
  ({ paymentId }) =>
    !paymentId
      ? {
          key: routes.driving.renewLicense.paymentSelection.slug,
          isStepValid: true,
        }
      : { key: null, isStepValid: true },
  ({ paymentId, status }) =>
    paymentId && status === "executed"
      ? {
          key: routes.driving.renewLicense.paymentSuccess.slug,
          isStepValid: true,
        }
      : { key: null, isStepValid: true },
  ({ paymentId, status }) =>
    paymentId && status !== "executed"
      ? {
          key: routes.driving.renewLicense.paymentError.slug,
          isStepValid: true,
        }
      : { key: null, isStepValid: true },
  () => ({ key: "success", isStepValid: true }),
];

// move
export const renewDriversLicenceFlowKey = "renewDriversLicence";

function FormLayout(
  props: React.PropsWithChildren<{
    action: { slug: string; href?: string };
    step: string;
    backHref?: string;
  }>,
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

export default async (props: web.NextPageProps) => {
  // Session details
  const { userId, email, firstName, lastName } = await PgSessions.get();

  const flowQuery = postgres.pgpool.query<
    { data: workflow.RenewDriversLicence },
    [string]
  >(
    `
    SELECT
        flow_data AS "data"
    FROM user_flow_data
    WHERE user_id=$1
    AND flow='renewDriversLicence'`,
    [userId],
  );

  const infoMedQuery = Promise.resolve([]);

  const [flowResult, infoMedResult] = await Promise.all([
    flowQuery,
    infoMedQuery,
  ]);

  const data = workflow.emptyRenewDriversLicence();

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

  const { key: nextSlug, isStepValid } = workflow.getCurrentStep(
    renewDriverLicenceRules,
    data,
  );

  // Act
  const stepSlug = props.params.action?.at(1);
  const actionSlug = props.params.action?.at(0) || ""; // should never ever be able to be empty at this point
  const baseActionHref = `/${props.params.locale}/driving/${actionSlug}/${nextSlug}`;

  switch (stepSlug) {
    case routes.driving.renewLicense.applicationSuccess.slug:
      return stepSlug === nextSlug ? (
        <FormLayout action={{ slug: actionSlug }} step={stepSlug}>
          <ApplicationSuccess flow={renewDriversLicenceFlowKey} />
        </FormLayout>
      ) : (
        redirect(nextSlug || "")
      );
    case routes.driving.renewLicense.medicalCertificate.slug:
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
        redirect(nextSlug || "")
      );
    case routes.driving.renewLicense.confirmApplication.slug:
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
            dataValid={isStepValid}
          />
        </FormLayout>
      ) : (
        redirect(nextSlug || "")
      );
    case routes.driving.renewLicense.newAddress.slug:
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
            searchParams={props.searchParams}
            flow={renewDriversLicenceFlowKey}
            userId={userId}
            data={data}
          />
        </FormLayout>
      );
    case routes.driving.renewLicense.changeDetails.slug:
      return (
        <FormLayout
          action={{
            slug: actionSlug,
            href: baseActionHref,
          }}
          step={stepSlug}
          backHref={baseActionHref}
        >
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
    case routes.driving.renewLicense.proofOfAddress.slug:
      return (
        <FormLayout
          action={{
            slug: actionSlug,
            href: baseActionHref,
          }}
          step={stepSlug}
          backHref={baseActionHref}
        >
          <ProofOfAddress
            step={props.searchParams?.step}
            flow={renewDriversLicenceFlowKey}
            userId={userId}
          />
        </FormLayout>
      );
    case routes.driving.renewLicense.paymentSelection.slug:
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

    case routes.driving.renewLicense.paymentSuccess.slug:
      return nextSlug === stepSlug ? (
        <FormLayout action={{ slug: stepSlug }} step={stepSlug}>
          <PaymentSuccess
            paymentId={data.paymentId!}
            dateOfPayment={data.dateOfPayment}
            pay={data.totalPayment}
            flow={renewDriversLicenceFlowKey}
          />
        </FormLayout>
      ) : (
        redirect(nextSlug || "")
      );

    case routes.driving.renewLicense.paymentError.slug:
      return nextSlug === stepSlug ? (
        <FormLayout action={{ slug: stepSlug }} step={stepSlug}>
          <PaymentError />
        </FormLayout>
      ) : (
        redirect(nextSlug || "")
      );

    // This should never be hit, but if it does, it means it's a high chance of infinite redirects happened due to mistake.
    case routes.driving.renewLicense.slug:
      return (
        <>
          Handle missed case of infinite redirection. Error page with "go home"
          link maybe?
        </>
      );
  }

  return redirect(`${routes.driving.renewLicense.slug}/${nextSlug}`);
};
