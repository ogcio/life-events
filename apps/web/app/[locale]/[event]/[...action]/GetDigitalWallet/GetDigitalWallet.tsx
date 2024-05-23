import { notFound, redirect } from "next/navigation";
import { web, workflow, routes } from "../../../../utils";
import { PgSessions } from "auth/sessions";
import FormLayout from "../../../../components/FormLayout";
import ApplicationSuccess from "./ApplicationSuccess";
import BeforeYouStart from "./BeforeYouStart";
import AboutYou from "./AboutYou";
import GovernmentDetails from "./GovernmentDetails";
import YourDevice from "./YourDevice";
import DetailsSummary from "./DetailsSummary";
import VerifyLevel0 from "./VerifyLevel0";
import VerifyLevel1 from "./VerifyLevel1";
import ChangeDetails from "./ChangeDetails";
import DeviceSelection from "./DeviceSelection";

const getDigitalWalletRulesVerified: Parameters<
  typeof workflow.getCurrentStep<workflow.GetDigitalWallet>
>[0] = [
  // Rule 1: Check if user has read the introduction
  ({ hasReadIntro }) => {
    return !hasReadIntro
      ? {
          key: routes.digitalWallet.getDigitalWallet.beforeYouStart.slug,
          isStepValid: true,
        }
      : {
          key: null,
          isStepValid: true,
        };
  },
  // ({}) => {
  //   /**handle logic here */
  //   return {
  //     key: routes.digitalWallet.getDigitalWallet.governmentDetails.slug,
  //     isStepValid: false,
  //   };
  // },
  //Rule 2: Check if personal details are populated and confirmed
  // (params) =>
  //   Boolean(
  //     params.firstName &&
  //       params.lastName &&
  //       params.myGovIdEmail &&
  //       params.hasConfirmedPersonalDetails,
  //   )
  //     ? { key: null, isStepValid: true }
  //     : {
  //         key: routes.digitalWallet.getDigitalWallet.aboutYou.slug,
  //         isStepValid: false,
  //       },
  //Rule 2: Check if employment details are populated
  (params) =>
    Boolean(params.govIEEmail && params.lineManagerName && params.jobTitle)
      ? { key: null, isStepValid: true }
      : {
          key: routes.digitalWallet.getDigitalWallet.governmentDetails.slug,
          isStepValid: false,
        },
  //Rule 3: Check if ios or android is selected
  ({ deviceType }) =>
    !deviceType
      ? {
          key: routes.digitalWallet.getDigitalWallet.deviceSelection.slug,
          isStepValid: false,
        }
      : { key: null, isStepValid: true },
  //Rule 4: Check if device details are populated
  (params) =>
    Boolean(params.appStoreEmail)
      ? { key: null, isStepValid: true }
      : {
          key: routes.digitalWallet.getDigitalWallet.yourDevice.slug,
          isStepValid: false,
        },

  // Rule 5: Check if application is confirmed
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

const getDigitalWalletRulesForLevel0: Parameters<
  typeof workflow.getCurrentStep<workflow.GetDigitalWallet>
>[0] = [
  // Rule 1: Show how to get verified instructions
  () => {
    return {
      key: routes.digitalWallet.getDigitalWallet.verifyLevel0.slug,
      isStepValid: true,
    };
  },
];

export const getDigitalWalletRulesForLevel1: Parameters<
  typeof workflow.getCurrentStep<workflow.GetDigitalWallet>
>[0] = [
  // Rule 1: Show how to get verified instructions
  () => {
    return {
      key: routes.digitalWallet.getDigitalWallet.verifyLevel1.slug,
      isStepValid: true,
    };
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

const BeforeYouStartStep: React.FC<FormProps> = ({
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
      <BeforeYouStart
        data={data}
        flow={workflow.keys.getDigitalWallet}
        userId={userId}
      />
    </FormLayout>
  ) : (
    redirect(nextSlug || "")
  );
};

const GovernmentDetailsStep: React.FC<FormProps> = ({
  stepSlug,
  actionSlug,
  nextSlug,
  data,
  userId,
  eventsPageHref,
  urlBase,
}) => {
  return stepSlug === nextSlug ? (
    <FormLayout
      action={{ slug: actionSlug }}
      step={stepSlug}
      backHref={eventsPageHref}
    >
      <GovernmentDetails
        data={data}
        urlBase={urlBase}
        flow={workflow.keys.getDigitalWallet}
        userId={userId}
      />
    </FormLayout>
  ) : (
    redirect(nextSlug || "")
  );
};

const DeviceSelectionStep: React.FC<FormProps> = ({
  stepSlug,
  actionSlug,
  nextSlug,
  data,
  userId,
  eventsPageHref,
  urlBase,
}) => {
  return stepSlug === nextSlug ? (
    <FormLayout
      action={{ slug: actionSlug }}
      step={stepSlug}
      backHref={eventsPageHref}
    >
      <DeviceSelection
        data={data}
        flow={workflow.keys.getDigitalWallet}
        userId={userId}
        urlBase={urlBase}
      />
    </FormLayout>
  ) : (
    redirect(nextSlug || "")
  );
};

const AboutYouStep: React.FC<FormProps> = ({
  stepSlug,
  actionSlug,
  nextSlug,
  data,
  userId,
  eventsPageHref,
  urlBase,
}) => {
  return stepSlug === nextSlug ? (
    <FormLayout
      action={{ slug: actionSlug }}
      step={stepSlug}
      backHref={eventsPageHref}
    >
      <AboutYou
        data={data}
        flow={workflow.keys.getDigitalWallet}
        userId={userId}
        urlBase={urlBase}
      />
    </FormLayout>
  ) : (
    redirect(nextSlug || "")
  );
};

const YourDeviceStep: React.FC<FormProps> = ({
  stepSlug,
  actionSlug,
  nextSlug,
  data,
  userId,
  eventsPageHref,
  urlBase,
}) => {
  return stepSlug === nextSlug ? (
    <FormLayout
      action={{ slug: actionSlug }}
      step={stepSlug}
      backHref={eventsPageHref}
    >
      <YourDevice
        data={data}
        flow={workflow.keys.getDigitalWallet}
        userId={userId}
        urlBase={urlBase}
      />
    </FormLayout>
  ) : (
    redirect(nextSlug || "")
  );
};

const DetailsSummaryStep: React.FC<FormProps> = ({
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
      <DetailsSummary
        data={data}
        flow={workflow.keys.getDigitalWallet}
        userId={userId}
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

const VerifyLevel0Step: React.FC<FormProps> = ({ actionSlug, stepSlug }) => {
  return (
    <FormLayout action={{ slug: actionSlug }} step={stepSlug}>
      <VerifyLevel0 />
    </FormLayout>
  );
};

const VerifyLevel1Step: React.FC<FormProps> = ({ actionSlug, stepSlug }) => {
  return (
    <FormLayout action={{ slug: actionSlug }} step={stepSlug}>
      <VerifyLevel1 />
    </FormLayout>
  );
};

const ChangeDetailsStep: React.FC<FormProps> = ({
  data,
  actionSlug,
  stepSlug,
  userId,
  urlBase,
}) => {
  return (
    <FormLayout action={{ slug: actionSlug }} step={stepSlug}>
      <ChangeDetails
        data={data}
        userId={userId}
        urlBase={urlBase}
        flow={workflow.keys.getDigitalWallet}
      />
    </FormLayout>
  );
};

const FormComponentsMap = {
  [routes.digitalWallet.getDigitalWallet.beforeYouStart.slug]:
    BeforeYouStartStep,
  // [routes.digitalWallet.getDigitalWallet.aboutYou.slug]: AboutYouStep,
  [routes.digitalWallet.getDigitalWallet.governmentDetails.slug]:
    GovernmentDetailsStep,
  [routes.digitalWallet.getDigitalWallet.deviceSelection.slug]:
    DeviceSelectionStep,
  [routes.digitalWallet.getDigitalWallet.yourDevice.slug]: YourDeviceStep,

  [routes.digitalWallet.getDigitalWallet.checkDetails.slug]: DetailsSummaryStep,
  [routes.digitalWallet.getDigitalWallet.applicationSuccess.slug]:
    ApplicationSuccessStep,
  [routes.digitalWallet.getDigitalWallet.verifyLevel0.slug]: VerifyLevel0Step,
  [routes.digitalWallet.getDigitalWallet.verifyLevel1.slug]: VerifyLevel1Step,
  [routes.digitalWallet.getDigitalWallet.changeDetails.slug]: ChangeDetailsStep,
};

export const verificationLevelToRulesMap = {
  0: getDigitalWalletRulesForLevel0,
  1: getDigitalWalletRulesForLevel1,
  2: getDigitalWalletRulesVerified,
};

export default async (props: web.NextPageProps) => {
  const { userId, verificationLevel } = await PgSessions.get();

  const data = await workflow.getFlowData(
    workflow.keys.getDigitalWallet,
    workflow.emptyGetDigitalWallet(),
  );

  const rules = verificationLevelToRulesMap[verificationLevel];

  const { key: nextSlug, isStepValid } = workflow.getCurrentStep(rules, data);

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
