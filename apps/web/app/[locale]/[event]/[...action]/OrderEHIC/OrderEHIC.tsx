import { notFound, redirect } from "next/navigation";
import { web, workflow, routes } from "../../../../utils";
import { PgSessions } from "auth/sessions";
import FormLayout from "../shared/FormLayout";
import SimpleDetailsForm from "./SimpleDetailsForm";
import DetailsSummary from "./DetailsSummary";
import AddressForm from "../shared/AddressForm";
import ProofOfAddress from "../shared/ProofOfAddress";
import { useTranslations } from "next-intl";
import LocalHealthOfficeForm from "./LocalHealthOfficeForm";
import ApplicationSuccess from "./ApplicationSuccess";

export const orderEHICRules: Parameters<
  typeof workflow.getCurrentStep<workflow.OrderEHIC>
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
          params.PPSN &&
          params.localHealthOffice &&
          params.dispatchAddress,
      )
    ) {
      return { key: null, isStepValid: true };
    }
    return {
      key: routes.health.orderEHIC.checkDetails.slug,
      isStepValid: false,
    };
  },
  // Rule 2: Check if application is confirmed
  ({ confirmedApplication }) =>
    !confirmedApplication
      ? {
          key: routes.health.orderEHIC.checkDetails.slug,
          isStepValid: true,
        }
      : {
          key: routes.health.orderEHIC.applicationSuccess.slug,
          isStepValid: true,
        },
];

type FormProps = {
  stepSlug: string;
  actionSlug: string;
  data: workflow.OrderEHIC;
  urlBase: string;
  userId: string;
  baseActionHref: string;
  nextSlug: string | null;
  isStepValid: boolean;
  params: web.NextPageProps["params"];
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
}) => {
  return stepSlug === nextSlug ? (
    <FormLayout
      action={{ slug: actionSlug }}
      step={stepSlug}
      backHref={"/events"}
    >
      <DetailsSummary
        data={data}
        flow={workflow.keys.orderEHIC}
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
        flow={workflow.keys.orderEHIC}
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
        flow={workflow.keys.orderEHIC}
        userId={userId}
        data={data}
        slug={routes.health.orderEHIC.newAddress.slug}
        category={workflow.categories.health}
        onSubmitRedirectSlug={routes.health.orderEHIC.proofOfAddress.slug}
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
        flow={workflow.keys.orderEHIC}
        userId={userId}
        slug={routes.health.orderEHIC.proofOfAddress.slug}
        onSubmitRedirectSlug={baseActionHref}
      />
    </FormLayout>
  );
};

const DispatchAddressStep: React.FC<FormProps> = ({
  actionSlug,
  baseActionHref,
  stepSlug,
  searchParams,
  userId,
  data,
  params,
}) => {
  const t = useTranslations("AddressForm");
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
        title={t("dispatch-address")}
        field={"dispatchAddress"}
        searchParams={searchParams}
        flow={workflow.keys.orderEHIC}
        userId={userId}
        data={data}
        slug={routes.health.orderEHIC.dispatchAddress.slug}
        category={workflow.categories.health}
        onSubmitRedirectSlug={`/${params.locale}/${routes.health.orderEHIC.path()}`}
        showWarning={false}
      />
    </FormLayout>
  );
};

const SelectLocalHealthOfficeStep: React.FC<FormProps> = ({
  actionSlug,
  baseActionHref,
  stepSlug,
  userId,
  data,
  params,
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
      <LocalHealthOfficeForm
        userId={userId}
        data={data}
        onSubmitRedirectSlug={`/${params.locale}/${routes.health.orderEHIC.path()}`}
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
        flow={workflow.keys.orderEHIC}
        data={data}
        onSubmitRedirectSlug={eventsPageHref}
      />
    </FormLayout>
  );
};

const FormComponentsMap = {
  [routes.health.orderEHIC.checkDetails.slug]: CheckDetailsStep,
  [routes.health.orderEHIC.changeDetails.slug]: ChangeDetailsStep,
  [routes.health.orderEHIC.newAddress.slug]: NewAddressStep,
  [routes.health.orderEHIC.proofOfAddress.slug]: ProofOfAddressStep,
  [routes.health.orderEHIC.dispatchAddress.slug]: DispatchAddressStep,
  [routes.health.orderEHIC.selectLocalHealthOffice.slug]:
    SelectLocalHealthOfficeStep,
  [routes.health.orderEHIC.applicationSuccess.slug]: ApplicationSuccessStep,
};

export default async (props: web.NextPageProps) => {
  const { userId } = await PgSessions.get();
  const data = await workflow.getFlowData(
    workflow.keys.orderEHIC,
    workflow.emptyOrderEHIC(),
  );

  const { key: nextSlug, isStepValid } = workflow.getCurrentStep(
    orderEHICRules,
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
        params={props.params}
        searchParams={props.searchParams}
        isStepValid={isStepValid}
      />
    );
  }

  return redirect(`${routes.health.orderEHIC.slug}/${nextSlug}`);
};
