import { notFound, redirect } from "next/navigation";
import { routes, web, workflow } from "../../../../utils";
import FormLayout from "../shared/FormLayout";
import Introduction from "./Introduction";
import { PgSessions } from "auth/sessions";
import BenefitsEntitlements from "./BenefitsEntitlements";
import Requirements from "./Requirements";
import Rates from "./Rates";
import Questions from "./Questions";
import ConfirmDetails from "./ConfirmDetails";
import SimpleDetailsForm from "./SimpleDetailsForm";

export const applyJobseekersAllowanceRules: Parameters<
  typeof workflow.getCurrentStep<workflow.ApplyJobseekersAllowance>
>[0] = [
  // Rule 1: Check if user has read the introduction
  ({ hasReadIntro }) => {
    return !hasReadIntro
      ? {
          key: routes.employment.applyJobseekersAllowance.introduction.slug,
          isStepValid: true,
        }
      : {
          key: null,
          isStepValid: true,
        };
  },
  // Rule 2: Check the user benefits entitlements
  ({ hasCheckedBenefits }) => {
    return !hasCheckedBenefits
      ? {
          key: routes.employment.applyJobseekersAllowance.benefitsEntitlements
            .slug,
          isStepValid: false,
        }
      : {
          key: null,
          isStepValid: true,
        };
  },
  // Rule 3: Check if user meets allowance requirements
  ({ hasRequirements }) => {
    return !hasRequirements
      ? {
          key: routes.employment.applyJobseekersAllowance.apply.slug,
          isStepValid: false,
        }
      : {
          key: null,
          isStepValid: true,
        };
  },
  //Rule 4: Check if user has read about rates
  ({ hasReadRates }) => {
    return !hasReadRates
      ? {
          key: routes.employment.applyJobseekersAllowance.rates.slug,
          isStepValid: false,
        }
      : {
          key: null,
          isStepValid: true,
        };
  },
  //Rule 4: Check if user has accepted questions
  ({ hasAcceptedQuestions }) => {
    return !hasAcceptedQuestions
      ? {
          key: routes.employment.applyJobseekersAllowance.questions.slug,
          isStepValid: false,
        }
      : {
          key: null,
          isStepValid: true,
        };
  },
  //Rule 5: Check if user has confirmed personal details
  ({ hasConfirmedDetails }) => {
    return !hasConfirmedDetails
      ? {
          key: routes.employment.applyJobseekersAllowance.confirmDetails.slug,
          isStepValid: false,
        }
      : {
          key: null,
          isStepValid: true,
        };
  },
];

type FormProps = {
  stepSlug: string;
  actionSlug: string;
  data: workflow.ApplyJobseekersAllowance;
  userId: string;
  nextSlug: string | null;
  isStepValid: boolean;
  params: web.NextPageProps["params"];
  searchParams: web.NextPageProps["searchParams"];
  flow: string;
  eventsPageHref: string;
  baseActionHref: string;
};

const IntroductionStep: React.FC<FormProps> = ({
  stepSlug,
  nextSlug,
  actionSlug,
  userId,
  flow,
  eventsPageHref,
  data,
}) => {
  return stepSlug === nextSlug ? (
    <FormLayout
      action={{ slug: actionSlug }}
      step={stepSlug}
      backHref={eventsPageHref}
    >
      <Introduction userId={userId} flow={flow} data={data} />
    </FormLayout>
  ) : (
    redirect(nextSlug || "")
  );
};

const BenefitsEntitlementsStep: React.FC<FormProps> = ({
  stepSlug,
  nextSlug,
  actionSlug,
  userId,
  flow,
  eventsPageHref,
}) => {
  return stepSlug === nextSlug ? (
    <FormLayout
      action={{ slug: actionSlug }}
      step={stepSlug}
      backHref={eventsPageHref}
    >
      <BenefitsEntitlements userId={userId} flow={flow} />
    </FormLayout>
  ) : (
    redirect(nextSlug || "")
  );
};

const RequirementsStep: React.FC<FormProps> = ({
  stepSlug,
  nextSlug,
  actionSlug,
  userId,
  flow,
  eventsPageHref,
}) => {
  return stepSlug === nextSlug ? (
    <FormLayout
      action={{ slug: actionSlug }}
      step={stepSlug}
      backHref={eventsPageHref}
    >
      <Requirements userId={userId} flow={flow} slug={stepSlug} />
    </FormLayout>
  ) : (
    redirect(nextSlug || "")
  );
};

const RatesStep: React.FC<FormProps> = ({
  stepSlug,
  nextSlug,
  actionSlug,
  userId,
  flow,
  eventsPageHref,
}) => {
  return stepSlug === nextSlug ? (
    <FormLayout
      action={{ slug: actionSlug }}
      step={stepSlug}
      backHref={eventsPageHref}
    >
      <Rates userId={userId} flow={flow} />
    </FormLayout>
  ) : (
    redirect(nextSlug || "")
  );
};

const QuestionsStep: React.FC<FormProps> = ({
  stepSlug,
  nextSlug,
  actionSlug,
  userId,
  flow,
  eventsPageHref,
}) => {
  return stepSlug === nextSlug ? (
    <FormLayout
      action={{ slug: actionSlug }}
      step={stepSlug}
      backHref={eventsPageHref}
    >
      <Questions userId={userId} flow={flow} />
    </FormLayout>
  ) : (
    redirect(nextSlug || "")
  );
};

const ConfirmDetailsStep: React.FC<FormProps> = ({
  stepSlug,
  nextSlug,
  actionSlug,
  userId,
  flow,
  eventsPageHref,
  data,
  isStepValid,
}) => {
  return stepSlug === nextSlug ? (
    <FormLayout
      action={{ slug: actionSlug }}
      step={stepSlug}
      backHref={eventsPageHref}
    >
      <ConfirmDetails
        userId={userId}
        flow={flow}
        data={data}
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
  userId,
  baseActionHref,
  flow,
  params,
}) => {
  return (
    <FormLayout
      action={{ slug: actionSlug, href: baseActionHref }}
      step={stepSlug}
      backHref={baseActionHref}
    >
      <SimpleDetailsForm
        data={data}
        flow={flow}
        onSubmitRedirectSlug={`/${params.locale}/${routes.employment.applyJobseekersAllowance.confirmDetails.path()}`}
        userId={userId}
      />
    </FormLayout>
  );
};

const FormComponentsMap = {
  [routes.employment.applyJobseekersAllowance.introduction.slug]:
    IntroductionStep,
  [routes.employment.applyJobseekersAllowance.benefitsEntitlements.slug]:
    BenefitsEntitlementsStep,
  [routes.employment.applyJobseekersAllowance.apply.slug]: RequirementsStep,
  [routes.employment.applyJobseekersAllowance.rates.slug]: RatesStep,
  [routes.employment.applyJobseekersAllowance.questions.slug]: QuestionsStep,
  [routes.employment.applyJobseekersAllowance.confirmDetails.slug]:
    ConfirmDetailsStep,
  [routes.employment.applyJobseekersAllowance.changeDetails.slug]:
    ChangeDetailsStep,
};

export default async (props: web.NextPageProps) => {
  const { userId } = await PgSessions.get();
  const data = await workflow.getFlowData(
    workflow.keys.applyJobseekersAllowance,
    workflow.emptyApplyJobseekersAllowance(),
  );
  const { key: nextSlug, isStepValid } = workflow.getCurrentStep(
    applyJobseekersAllowanceRules,
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
        userId={userId}
        params={props.params}
        searchParams={props.searchParams}
        isStepValid={isStepValid}
        flow={workflow.keys.applyJobseekersAllowance}
        baseActionHref={baseActionHref}
      />
    );
  }

  return redirect(
    `${routes.employment.applyJobseekersAllowance.slug}/${nextSlug}`,
  );
};
