import dayjs from "dayjs";
import { notFound, redirect } from "next/navigation";
import { PgSessions } from "auth/sessions";
import { routes, workflow, postgres, web } from "../../../../utils";
import AddressForm from "../shared/AddressForm";
import ApplicationSuccess from "./ApplicationSuccess";
import DetailsSummary from "./DetailsSummary";
import MedicalForm from "./MedicalForm";
import PaymentPlaceholder from "./PaymentPlaceholder";
import ProofOfAddress from "../shared/ProofOfAddress";
import SimpleDetailsForm from "./SimpleDetailsForm";
import PaymentSuccess from "./PaymentSuccess";
import PaymentError from "./PaymentError";
import FormLayout from "../shared/FormLayout";
import ServerErrorPage from "../../../ServerErrorPage";

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
      key: routes.driving.renewDriversLicence.confirmApplication.slug,
      isStepValid: false,
    };
  },
  ({ confirmedApplication }) =>
    !confirmedApplication
      ? {
          key: routes.driving.renewDriversLicence.confirmApplication.slug,
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
          key: routes.driving.renewDriversLicence.medicalCertificate.slug,
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
          key: routes.driving.renewDriversLicence.applicationSuccess.slug,
          isStepValid: true,
        }
      : { key: null, isStepValid: false };
  },
  ({ paymentId }) =>
    !paymentId
      ? {
          key: routes.driving.renewDriversLicence.paymentSelection.slug,
          isStepValid: true,
        }
      : { key: null, isStepValid: true },
  ({ paymentId, status }) =>
    paymentId && status === "executed"
      ? {
          key: routes.driving.renewDriversLicence.paymentSuccess.slug,
          isStepValid: true,
        }
      : { key: null, isStepValid: true },
  ({ paymentId, status }) =>
    paymentId && status !== "executed"
      ? {
          key: routes.driving.renewDriversLicence.paymentError.slug,
          isStepValid: true,
        }
      : { key: null, isStepValid: true },
  () => ({ key: "success", isStepValid: true }),
];

type FormProps = {
  stepSlug: string;
  actionSlug: string;
  data: workflow.RenewDriversLicence;
  urlBase: string;
  userId: string;
  baseActionHref: string;
  nextSlug: string | null;
  isStepValid: boolean;
  params: web.NextPageProps["params"];
  searchParams: web.NextPageProps["searchParams"];
};

const MedicalCertificateStep: React.FC<FormProps> = ({
  actionSlug,
  stepSlug,
  nextSlug,
  baseActionHref,
  userId,
  params,
  searchParams,
}) => {
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
        flow={workflow.keys.renewDriversLicence}
        userId={userId}
        params={params}
        searchParams={searchParams}
      />
    </FormLayout>
  ) : (
    redirect(nextSlug || "")
  );
};

const ConfirmApplicationStep: React.FC<FormProps> = ({
  actionSlug,
  stepSlug,
  nextSlug,
  userId,
  data,
  isStepValid,
}) => {
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
        flow={workflow.keys.renewDriversLicence}
        proofOfAddressRequest={data.proofOfAddressRequest}
        dataValid={isStepValid}
      />
    </FormLayout>
  ) : (
    redirect(nextSlug || "")
  );
};

const NewAddressStep: React.FC<FormProps> = ({
  actionSlug,
  stepSlug,
  baseActionHref,
  searchParams,
  userId,
  data,
}) => {
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
        field={"currentAddress"}
        searchParams={searchParams}
        flow={workflow.keys.renewDriversLicence}
        userId={userId}
        data={data}
        slug={routes.driving.renewDriversLicence.newAddress.slug}
        category={workflow.categories.driving}
        onSubmitRedirectSlug={
          routes.driving.renewDriversLicence.proofOfAddress.slug
        }
        showWarning={true}
      />
    </FormLayout>
  );
};

const ChangeDetailsStep: React.FC<FormProps> = ({
  actionSlug,
  stepSlug,
  baseActionHref,
  data,
  params,
  userId,
}) => {
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
        flow={workflow.keys.renewDriversLicence}
        urlBase={`/${params.locale}/${params.event}/${actionSlug}`}
      />
    </FormLayout>
  );
};

const ProofOfAddressStep: React.FC<FormProps> = ({
  actionSlug,
  stepSlug,
  baseActionHref,
  searchParams,
  userId,
}) => {
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
        step={searchParams?.step}
        flow={workflow.keys.renewDriversLicence}
        userId={userId}
        slug={routes.driving.renewDriversLicence.proofOfAddress.slug}
        onSubmitRedirectSlug={baseActionHref}
      />
    </FormLayout>
  );
};

const PaymentSelectionStep: React.FC<FormProps> = ({
  actionSlug,
  stepSlug,
  nextSlug,
  baseActionHref,
  userId,
}) => {
  return nextSlug === stepSlug ? (
    <FormLayout
      action={{ slug: actionSlug }}
      step={stepSlug}
      backHref={baseActionHref}
    >
      <PaymentPlaceholder
        flow={workflow.keys.renewDriversLicence}
        userId={userId}
      />
    </FormLayout>
  ) : (
    redirect(nextSlug || "")
  );
};

const PaymentSuccessStep: React.FC<FormProps> = ({
  stepSlug,
  nextSlug,
  data,
}) => {
  return nextSlug === stepSlug ? (
    <FormLayout action={{ slug: stepSlug }} step={stepSlug}>
      <PaymentSuccess
        paymentId={data.paymentId!}
        dateOfPayment={data.dateOfPayment}
        pay={data.totalPayment}
        flow={workflow.keys.renewDriversLicence}
      />
    </FormLayout>
  ) : (
    redirect(nextSlug || "")
  );
};

const PaymentErrorStep: React.FC<FormProps> = ({ stepSlug, nextSlug }) => {
  return nextSlug === stepSlug ? (
    <FormLayout action={{ slug: stepSlug }} step={stepSlug}>
      <PaymentError />
    </FormLayout>
  ) : (
    redirect(nextSlug || "")
  );
};

const ApplicationSuccessStep: React.FC<FormProps> = ({
  actionSlug,
  stepSlug,
  nextSlug,
}) => {
  return stepSlug === nextSlug ? (
    <FormLayout action={{ slug: actionSlug }} step={stepSlug}>
      <ApplicationSuccess flow={workflow.keys.renewDriversLicence} />
    </FormLayout>
  ) : (
    redirect(nextSlug || "")
  );
};

const FormComponentsMap = {
  [routes.driving.renewDriversLicence.confirmApplication.slug]:
    ConfirmApplicationStep,
  [routes.driving.renewDriversLicence.changeDetails.slug]: ChangeDetailsStep,
  [routes.driving.renewDriversLicence.newAddress.slug]: NewAddressStep,
  [routes.driving.renewDriversLicence.proofOfAddress.slug]: ProofOfAddressStep,
  [routes.driving.renewDriversLicence.medicalCertificate.slug]:
    MedicalCertificateStep,
  [routes.driving.renewDriversLicence.paymentSelection.slug]:
    PaymentSelectionStep,
  [routes.driving.renewDriversLicence.paymentSuccess.slug]: PaymentSuccessStep,
  [routes.driving.renewDriversLicence.paymentError.slug]: PaymentErrorStep,
  [routes.driving.renewDriversLicence.applicationSuccess.slug]:
    ApplicationSuccessStep,
};

export default async (props: web.NextPageProps) => {
  const { userId } = await PgSessions.get();
  const data = await workflow.getFlowData(
    workflow.keys.renewDriversLicence,
    workflow.emptyRenewDriversLicence(),
  );

  const { key: nextSlug, isStepValid } = workflow.getCurrentStep(
    renewDriverLicenceRules,
    data,
  );

  // Act
  const stepSlug = props.params.action?.at(1);
  const actionSlug = props.params.action?.at(0);
  const baseActionHref = `/${props.params.locale}/driving/${actionSlug}/${nextSlug}`;

  if (!actionSlug) {
    throw notFound();
  }

  if (stepSlug) {
    const StepComponent = FormComponentsMap[stepSlug];

    if (!StepComponent) {
      throw notFound();
    }

    return (
      <StepComponent
        stepSlug={stepSlug}
        actionSlug={actionSlug}
        nextSlug={nextSlug}
        data={data}
        urlBase={`/${props.params.locale}/${props.params.event}/${actionSlug}`}
        userId={userId}
        baseActionHref={baseActionHref}
        searchParams={props.searchParams}
        params={props.params}
        isStepValid={isStepValid}
      />
    );
  }

  return redirect(`${routes.driving.renewDriversLicence.slug}/${nextSlug}`);
};
