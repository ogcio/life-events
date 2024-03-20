import { notFound, redirect } from "next/navigation";
import { routes, web, workflow } from "../../../../utils";
import FormLayout from "../shared/FormLayout";
import Introduction from "./Introduction";
import { PgSessions } from "auth/sessions";
import BenefitsEntitlements from "./BenefitsEntitlements";
import Requirements from "./Requirements";

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
  //   // Rule 2: Check the benefits entitlements
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
};

const IntroductionStep: React.FC<FormProps> = ({
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
      <Introduction userId={userId} flow={flow} />
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

const FormComponentsMap = {
  [routes.employment.applyJobseekersAllowance.introduction.slug]:
    IntroductionStep,
  [routes.employment.applyJobseekersAllowance.benefitsEntitlements.slug]:
    BenefitsEntitlementsStep,
  [routes.employment.applyJobseekersAllowance.apply.slug]: RequirementsStep,
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
      />
    );
  }

  return redirect(
    `${routes.employment.applyJobseekersAllowance.slug}/${nextSlug}`,
  );
};
