import { notFound, redirect } from "next/navigation";
import { web, workflow, routes } from "../../../../utils";
import { PgSessions } from "auth/sessions";
import FormLayout from "../../../../components/FormLayout";
import ApplicationForm from "./ApplicationForm";
import ApplicationSuccess from "./ApplicationSuccess";
import BeforeYouBegin from "./BeforeYouBegin";

export const getDigitalWalletRules: Parameters<
  typeof workflow.getCurrentStep<workflow.GetDigitalWallet>
>[0] = [
  // Rule 1: Check if user has read the introduction
  ({ hasReadIntro }) => {
    return !hasReadIntro
      ? {
          key: routes.digitalWallet.getDigitalWallet.beforeYouBegin.slug,
          isStepValid: true,
        }
      : {
          key: null,
          isStepValid: true,
        };
  },
  //Rule 2: Check if all details are populated
  (params) =>
    Boolean(
      params.firstName &&
        params.lastName &&
        params.appStoreEmail &&
        params.myGovIdEmail &&
        params.govIEEmail &&
        params.lineManagerName &&
        params.jobTitle,
    )
      ? { key: null, isStepValid: true }
      : {
          key: routes.digitalWallet.getDigitalWallet.apply.slug,
          isStepValid: false,
        },
  // Rule 3: Check if application is confirmed
  ({ confirmedApplication }) =>
    !confirmedApplication
      ? {
          key: routes.digitalWallet.getDigitalWallet.apply.slug,
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

const BeforeYouBeginStep: React.FC<FormProps> = ({
  stepSlug,
  actionSlug,
  nextSlug,
  data,
  userId,
  eventsPageHref,
}) => {
  return stepSlug === nextSlug ? (
    <FormLayout
      action={{ slug: actionSlug }}
      step={stepSlug}
      backHref={eventsPageHref}
    >
      <BeforeYouBegin
        data={data}
        flow={workflow.keys.getDigitalWallet}
        userId={userId}
      />
    </FormLayout>
  ) : (
    redirect(nextSlug || "")
  );
};

const ApplyStep: React.FC<FormProps> = ({
  stepSlug,
  actionSlug,
  nextSlug,
  data,
  userId,
  eventsPageHref,
}) => {
  return stepSlug === nextSlug ? (
    <FormLayout
      action={{ slug: actionSlug }}
      step={stepSlug}
      backHref={eventsPageHref}
    >
      <ApplicationForm
        data={data}
        flow={workflow.keys.getDigitalWallet}
        userId={userId}
        urlBase={"/"}
      />
    </FormLayout>
  ) : (
    redirect(nextSlug || "")
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
  [routes.digitalWallet.getDigitalWallet.beforeYouBegin.slug]:
    BeforeYouBeginStep,
  [routes.digitalWallet.getDigitalWallet.apply.slug]: ApplyStep,
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
