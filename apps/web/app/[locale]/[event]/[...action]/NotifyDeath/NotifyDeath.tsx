import { notFound, redirect } from "next/navigation";
import { routes, web, workflow } from "../../../../utils";
import FormLayout from "../shared/FormLayout";
import { PgSessions } from "auth/sessions";
import RequiredInformationForm from "./RequiredInformationForm";
import AuthorityCheckForm from "./AuthorityCheckForm";
import DetailsForm from "./DetailsForm";
import ConfirmNotificationForm from "./ConfirmNotificationForm";
import ServicesToInformForm from "./ServicesToInformForm";
import NotificationSuccess from "./NotificationSuccess";

export const notifyDeathRules: Parameters<
  typeof workflow.getCurrentStep<workflow.NotifyDeath>
>[0] = [
  // Rule 1: Check if user has required information
  (params) => {
    if (!params.hasRequiredInformation) {
      return {
        key: routes.death.notifyDeath.requiredInformation.slug,
        isStepValid: true,
      };
    }
    return {
      key: null,
      isStepValid: true,
    };
  },
  // Rule 2: Check if user has authority
  ({ hasAuthority }) =>
    !hasAuthority
      ? {
          key: routes.death.notifyDeath.authorityCheck.slug,
          isStepValid: false,
        }
      : {
          key: null,
          isStepValid: true,
        },
  // Rule 3: Check that all details are populated
  ({
    referenceNumber,
    deceasedSurname,
    dayOfDeath,
    monthOfDeath,
    yearOfDeath,
  }) =>
    Boolean(
      referenceNumber &&
        deceasedSurname &&
        dayOfDeath &&
        monthOfDeath &&
        yearOfDeath,
    )
      ? {
          key: null,
          isStepValid: true,
        }
      : {
          key: routes.death.notifyDeath.details.slug,
          isStepValid: false,
        },
  //Rule 4: Confirm notification
  ({ confirmedNotification }) =>
    confirmedNotification
      ? {
          key: null,
          isStepValid: true,
        }
      : {
          key: routes.death.notifyDeath.confirmNotification.slug,
          isStepValid: false,
        },
  //Rule 5: Check services to inform
  ({ servicesToInform }) =>
    servicesToInform?.length
      ? {
          key: routes.death.notifyDeath.notificationSuccess.slug,
          isStepValid: true,
        }
      : {
          key: routes.death.notifyDeath.servicesToInform.slug,
          isStepValid: false,
        },
];

type FormProps = {
  stepSlug: string;
  actionSlug: string;
  data: workflow.NotifyDeath;
  userId: string;
  nextSlug: string | null;
  isStepValid: boolean;
  params: web.NextPageProps["params"];
  searchParams: web.NextPageProps["searchParams"];
  flow: string;
  eventsPageHref: string;
};

const RequiredInformationStep: React.FC<FormProps> = ({
  stepSlug,
  actionSlug,
  userId,
  flow,
  eventsPageHref,
  params,
}) => {
  return (
    <FormLayout
      action={{ slug: actionSlug }}
      step={stepSlug}
      backHref={eventsPageHref}
    >
      <RequiredInformationForm
        userId={userId}
        flow={flow}
        onSubmitRedirectSlug={`/${params.locale}/${routes.death.notifyDeath.authorityCheck.path()}`}
      />
    </FormLayout>
  );
};

const AuthorityCheckStep: React.FC<FormProps> = ({
  actionSlug,
  stepSlug,
  userId,
  flow,
  eventsPageHref,
  params,
}) => {
  return (
    <FormLayout
      action={{ slug: actionSlug }}
      backHref={eventsPageHref}
      step={stepSlug}
    >
      <AuthorityCheckForm
        userId={userId}
        flow={flow}
        slug={routes.death.notifyDeath.authorityCheck.slug}
        onSubmitRedirectSlug={`/${params.locale}/${routes.death.notifyDeath.details.path()}`}
      />
    </FormLayout>
  );
};

const DetailsStep: React.FC<FormProps> = ({
  actionSlug,
  stepSlug,
  userId,
  flow,
  data,
  eventsPageHref,
  params,
}) => {
  return (
    <FormLayout
      action={{ slug: actionSlug }}
      backHref={eventsPageHref}
      step={stepSlug}
    >
      <DetailsForm
        userId={userId}
        flow={flow}
        slug={routes.death.notifyDeath.details.slug}
        onSubmitRedirectSlug={`/${params.locale}/${routes.death.notifyDeath.confirmNotification.path()}`}
        data={data}
      />
    </FormLayout>
  );
};

const ConfirmNotificationStep: React.FC<FormProps> = ({
  actionSlug,
  stepSlug,
  userId,
  flow,
  data,
  eventsPageHref,
  params,
}) => {
  return (
    <FormLayout
      action={{ slug: actionSlug }}
      backHref={eventsPageHref}
      step={stepSlug}
    >
      <ConfirmNotificationForm
        userId={userId}
        flow={flow}
        data={data}
        onSubmitRedirectSlug={`/${params.locale}/${routes.death.notifyDeath.servicesToInform.path()}`}
      />
    </FormLayout>
  );
};

const ServicesToInformStep: React.FC<FormProps> = ({
  actionSlug,
  stepSlug,
  userId,
  flow,
  eventsPageHref,
  params,
}) => {
  return (
    <FormLayout
      action={{ slug: actionSlug }}
      backHref={eventsPageHref}
      step={stepSlug}
    >
      <ServicesToInformForm
        userId={userId}
        flow={flow}
        slug={routes.death.notifyDeath.details.slug}
        onSubmitRedirectSlug={`/${params.locale}/${routes.death.notifyDeath.notificationSuccess.path()}`}
      />
    </FormLayout>
  );
};

const NotificationSuccessStep: React.FC<FormProps> = ({
  actionSlug,
  stepSlug,
  flow,
  data,
  eventsPageHref,
}) => {
  return (
    <FormLayout action={{ slug: actionSlug }} step={stepSlug}>
      <NotificationSuccess
        flow={flow}
        data={data}
        onSubmitRedirectSlug={eventsPageHref}
      />
    </FormLayout>
  );
};

const FormComponentsMap = {
  [routes.death.notifyDeath.requiredInformation.slug]: RequiredInformationStep,
  [routes.death.notifyDeath.authorityCheck.slug]: AuthorityCheckStep,
  [routes.death.notifyDeath.details.slug]: DetailsStep,
  [routes.death.notifyDeath.confirmNotification.slug]: ConfirmNotificationStep,
  [routes.death.notifyDeath.servicesToInform.slug]: ServicesToInformStep,
  [routes.death.notifyDeath.notificationSuccess.slug]: NotificationSuccessStep,
};

export default async (props: web.NextPageProps) => {
  const { userId } = await PgSessions.get();
  const data = await workflow.getFlowData(
    workflow.keys.notifyDeath,
    workflow.emptyNotifyDeath(),
  );
  const { key: nextSlug, isStepValid } = workflow.getCurrentStep(
    notifyDeathRules,
    data,
  );

  const stepSlug = props.params.action?.at(1);
  const actionSlug = props.params.action?.at(0);

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
        userId={userId}
        params={props.params}
        searchParams={props.searchParams}
        isStepValid={isStepValid}
        flow={workflow.keys.notifyDeath}
      />
    );
  }

  return redirect(`${routes.death.notifyDeath.slug}/${nextSlug}`);
};
