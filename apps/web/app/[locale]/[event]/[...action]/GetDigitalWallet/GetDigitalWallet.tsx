import { notFound, redirect } from "next/navigation";
import { web, workflow, routes } from "../../../../utils";
import { PgSessions } from "auth/sessions";
import FormLayout from "../../../../components/FormLayout";
import SimpleDetailsForm from "./SimpleDetailsForm";
import DetailsSummary from "./DetailsSummary";
import AddressForm from "../shared/AddressForm";
import ProofOfAddress from "../shared/ProofOfAddress";
import ApplicationSuccess from "./ApplicationSuccess";

export const getDigitalWalletRules: Parameters<
  typeof workflow.getCurrentStep<workflow.GetDigitalWallet>
>[0] = [
  // Rule 1: Check if all personal details are populated
  (params) => {
    if (
      Boolean(
        params.currentAddress &&
          params.dayOfBirth &&
          params.monthOfBirth &&
          params.yearOfBirth &&
          params.userName &&
          params.sex &&
          params.email &&
          params.mobile &&
          params.timeAtAddress,
      )
    ) {
      return { key: null, isStepValid: true };
    }
    return {
      key: routes.digitalWallet.getDigitalWallet.checkDetails.slug,
      isStepValid: false,
    };
  },
  // Rule 2: Check if application is confirmed
  ({ confirmedApplication }) =>
    !confirmedApplication
      ? {
          key: routes.digitalWallet.getDigitalWallet.checkDetails.slug,
          isStepValid: true,
        }
      : {
          key: routes.digitalWallet.getDigitalWallet.applicationSuccess.slug,
          isStepValid: true,
        },
];

type FormProps = {
  stepSlug: string;
  actionSlug: string;
  data: workflow.GetDigitalWallet;
  urlBase: string;
  userId: string;
  baseActionHref: string;
  nextSlug: string | null;
  isStepValid: boolean;
  searchParams: web.NextPageProps["searchParams"];
  eventsPageHref: string;
};

const CheckDetailsStep: React.FC<FormProps> = ({
  stepSlug,
  actionSlug,
  nextSlug,
  data,
  userId,
  isStepValid,
  eventsPageHref,
}) => {
  return stepSlug === nextSlug ? (
    <FormLayout
      action={{ slug: actionSlug }}
      step={stepSlug}
      backHref={eventsPageHref}
    >
      <DetailsSummary
        data={data}
        flow={workflow.keys.getDigitalWallet}
        userId={userId}
        dataValid={isStepValid}
      />
    </FormLayout>
  ) : (
    redirect(nextSlug || "")
  );
};

const ChangeDetailsStep: React.FC<FormProps> = ({
  stepSlug,
  actionSlug,
  data,
  urlBase,
  userId,
  baseActionHref,
}) => {
  return (
    <FormLayout
      action={{ slug: actionSlug, href: baseActionHref }}
      step={stepSlug}
      backHref={baseActionHref}
    >
      <SimpleDetailsForm
        data={data}
        flow={workflow.keys.getDigitalWallet}
        urlBase={urlBase}
        userId={userId}
      />
    </FormLayout>
  );
};

const NewAddressStep: React.FC<FormProps> = ({
  stepSlug,
  actionSlug,
  data,
  searchParams,
  userId,
  baseActionHref,
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
        flow={workflow.keys.getDigitalWallet}
        userId={userId}
        data={data}
        slug={routes.digitalWallet.getDigitalWallet.newAddress.slug}
        category={workflow.categories.digitalWallet}
        onSubmitRedirectSlug={
          routes.digitalWallet.getDigitalWallet.proofOfAddress.slug
        }
        showWarning={true}
      />
    </FormLayout>
  );
};

const ProofOfAddressStep: React.FC<FormProps> = ({
  actionSlug,
  baseActionHref,
  stepSlug,
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
        flow={workflow.keys.getDigitalWallet}
        userId={userId}
        slug={routes.digitalWallet.getDigitalWallet.proofOfAddress.slug}
        onSubmitRedirectSlug={baseActionHref}
      />
    </FormLayout>
  );
};

const ApplicationSuccessStep: React.FC<FormProps> = ({
  actionSlug,
  stepSlug,
  data,
  eventsPageHref,
}) => {
  return (
    <FormLayout action={{ slug: actionSlug }} step={stepSlug}>
      <ApplicationSuccess
        flow={workflow.keys.getDigitalWallet}
        data={data}
        onSubmitRedirectSlug={eventsPageHref}
      />
    </FormLayout>
  );
};

const FormComponentsMap = {
  [routes.digitalWallet.getDigitalWallet.checkDetails.slug]: CheckDetailsStep,
  [routes.digitalWallet.getDigitalWallet.changeDetails.slug]: ChangeDetailsStep,
  [routes.digitalWallet.getDigitalWallet.newAddress.slug]: NewAddressStep,
  [routes.digitalWallet.getDigitalWallet.proofOfAddress.slug]:
    ProofOfAddressStep,
  [routes.digitalWallet.getDigitalWallet.applicationSuccess.slug]:
    ApplicationSuccessStep,
};

export default async (props: web.NextPageProps) => {
  const { userId } = await PgSessions.get();

  const data = await workflow.getFlowData(
    workflow.keys.getDigitalWallet,
    workflow.emptyGetDigitalWallet(),
  );

  const { key: nextSlug, isStepValid } = workflow.getCurrentStep(
    getDigitalWalletRules,
    data,
  );

  const stepSlug = props.params.action?.at(1);
  const actionSlug = props.params.action?.at(0);
  const baseActionHref = `/${props.params.locale}/${props.params.event}/${actionSlug}/${nextSlug}`;

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
        eventsPageHref={`/${props.params.locale}/${routes.events.slug}`}
        urlBase={`/${props.params.locale}/${props.params.event}/${actionSlug}`}
        userId={userId}
        baseActionHref={baseActionHref}
        searchParams={props.searchParams}
        isStepValid={isStepValid}
      />
    );
  }

  return redirect(`${routes.digitalWallet.getDigitalWallet.slug}/${nextSlug}`);
};
