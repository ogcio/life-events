/**
 * A workflow is a series of forms or acknowledgements a user does to go through a life event.
 *
 * We store a state of the progress in a jsonb column. There's workflow with or without payments. All workflows
 * must derive from either Workflow types.
 */

import { PgSessions } from "auth/sessions";
import { postgres } from ".";

// ===== Base =====
type Base = {
  rejectReason: string;
  rejectedAt: string;
  successfulAt: string;
};

type WithPayment = Base & {
  paymentId: number | null;
  dateOfPayment: string;
  totalPayment: string;
};

// ===== Workflows =====

export type RenewDriversLicence = WithPayment & {
  userName: string;
  sex: string;
  dayOfBirth: string;
  monthOfBirth: string;
  yearOfBirth: string;
  currentAddress: string;
  currentAddressVerified: string;
  timeAtAddress: string;
  email: string;
  mobile: string;
  proofOfAddressRequest: string;
  confirmedApplication: string;
  rejectReason: string;
  medicalCertificate: string;
  proofOfAddressFileId: string;
  status: string;
};

export function emptyRenewDriversLicence(): RenewDriversLicence {
  return {
    userName: "",
    sex: "",
    dayOfBirth: "",
    monthOfBirth: "",
    yearOfBirth: "",
    currentAddress: "",
    currentAddressVerified: "",
    timeAtAddress: "",
    email: "",
    mobile: "",
    paymentId: null,
    proofOfAddressRequest: "",
    totalPayment: "",
    dateOfPayment: "",
    confirmedApplication: "",
    successfulAt: "",
    rejectReason: "",
    medicalCertificate: "",
    proofOfAddressFileId: "",
    status: "",
    rejectedAt: "",
  };
}

export type OrderEHIC = Base & {
  userName: string;
  sex: string;
  dayOfBirth: string;
  monthOfBirth: string;
  yearOfBirth: string;
  PPSN: string;
  currentAddress: string;
  currentAddressVerified: string;
  email: string;
  proofOfAddressRequest: string;
  confirmedApplication: string;
  rejectReason: string;
  proofOfAddressFileId: string;
  status: string;
  localHealthOffice: string;
  dispatchAddress: string;
  submittedAt: string;
};

export function emptyOrderEHIC(): OrderEHIC {
  return {
    userName: "",
    sex: "",
    dayOfBirth: "",
    monthOfBirth: "",
    yearOfBirth: "",
    PPSN: "",
    currentAddress: "",
    currentAddressVerified: "",
    email: "",
    proofOfAddressRequest: "",
    confirmedApplication: "",
    successfulAt: "",
    rejectedAt: "",
    rejectReason: "",
    proofOfAddressFileId: "",
    status: "",
    localHealthOffice: "",
    dispatchAddress: "",
    submittedAt: "",
  };
}

export type OrderBirthCertificate = Base & {
  userName: string;
  sex: string;
  dayOfBirth: string;
  monthOfBirth: string;
  yearOfBirth: string;
  PPSN: string;
  currentAddress: string;
  currentAddressVerified: string;
  timeAtAddress: string;
  email: string;
  mobile: string;
  proofOfAddressRequest: string;
  confirmedApplication: string;
  rejectReason: string;
  proofOfAddressFileId: string;
  status: string;
  submittedAt: string;
};

export function emptyOrderBirthCertificate(): OrderBirthCertificate {
  return {
    userName: "",
    sex: "",
    dayOfBirth: "",
    monthOfBirth: "",
    yearOfBirth: "",
    PPSN: "",
    currentAddress: "",
    timeAtAddress: "",
    currentAddressVerified: "",
    email: "",
    mobile: "",
    proofOfAddressRequest: "",
    confirmedApplication: "",
    successfulAt: "",
    rejectedAt: "",
    rejectReason: "",
    proofOfAddressFileId: "",
    status: "",
    submittedAt: "",
  };
}

export type NotifyDeath = Base & {
  userName: string;
  hasRequiredInformation: boolean;
  hasAuthority: boolean;
  referenceNumber: string;
  deceasedSurname: string;
  dayOfDeath: string;
  monthOfDeath: string;
  yearOfDeath: string;
  confirmedNotification: boolean;
  servicesToInform: string[];
  submittedAt: string;
};

export function emptyNotifyDeath(): NotifyDeath {
  return {
    userName: "",
    hasRequiredInformation: false,
    hasAuthority: false,
    referenceNumber: "",
    deceasedSurname: "",
    dayOfDeath: "",
    monthOfDeath: "",
    yearOfDeath: "",
    confirmedNotification: false,
    servicesToInform: [],
    successfulAt: "",
    rejectedAt: "",
    rejectReason: "",
    submittedAt: "",
  };
}

export type ApplyJobseekersAllowance = Base & {
  userName: string;
  email: string;
  contactNumber: string;
  currentAddress: string;
  hasReadIntro: boolean;
  hasCheckedBenefits: boolean;
  hasRequirements: boolean;
  hasReadRates: boolean;
  hasAcceptedQuestions: boolean;
  hasConfirmedDetails: boolean;
  submittedAt: string;
};

export function emptyApplyJobseekersAllowance(): ApplyJobseekersAllowance {
  return {
    userName: "",
    email: "",
    contactNumber: "",
    currentAddress: "",
    hasReadIntro: false,
    hasCheckedBenefits: false,
    hasRequirements: false,
    hasReadRates: false,
    hasAcceptedQuestions: false,
    hasConfirmedDetails: false,
    successfulAt: "",
    rejectedAt: "",
    rejectReason: "",
    submittedAt: "",
  };
}

export type GetDigitalWallet = Base & {
  userName: string;
  sex: string;
  dayOfBirth: string;
  monthOfBirth: string;
  yearOfBirth: string;
  PPSN: string;
  currentAddress: string;
  currentAddressVerified: string;
  timeAtAddress: string;
  email: string;
  mobile: string;
  proofOfAddressRequest: string;
  confirmedApplication: string;
  rejectReason: string;
  proofOfAddressFileId: string;
  status: string;
  submittedAt: string;
};

export function emptyGetDigitalWallet(): GetDigitalWallet {
  return {
    userName: "",
    sex: "",
    dayOfBirth: "",
    monthOfBirth: "",
    yearOfBirth: "",
    PPSN: "",
    currentAddress: "",
    timeAtAddress: "",
    currentAddressVerified: "",
    email: "",
    mobile: "",
    proofOfAddressRequest: "",
    confirmedApplication: "",
    successfulAt: "",
    rejectedAt: "",
    rejectReason: "",
    proofOfAddressFileId: "",
    status: "",
    submittedAt: "",
  };
}

export type Workflow =
  | RenewDriversLicence
  | OrderEHIC
  | OrderBirthCertificate
  | NotifyDeath
  | ApplyJobseekersAllowance
  | GetDigitalWallet;

// ===== workflow keys =====

export const keys = {
  renewDriversLicence: "renewDriversLicence",
  orderEHIC: "orderEHIC",
  orderBirthCertificate: "orderBirthCertificate",
  notifyDeath: "notifyDeath",
  applyJobseekersAllowance: "applyJobseekersAllowance",
  correctBirthCertificate: "correctBirthCertificate",
  overseasBirthCertificate: "overseasBirthCertificate",
  addFatherNameBirthCertificate: "addFatherNameBirthCertificate",
  overseasDeathCertificate: "overseasDeathCertificate",
  changeWillAfterDeath: "changeWillAfterDeath",
  declarationPresumedDeath: "declarationPresumedDeath",
  replaceLostStolenLicence: "replaceLostStolenLicence",
  drivingLicenceCategories: "drivingLicenceCategories",
  payEmployersPaye: "payEmployersPaye",
  employmentTribunal: "employmentTribunal",
  selfEmployedExpenses: "selfEmployedExpenses",
  irishHealthSecurityAgency: "irishHealthSecurityAgency",
  workHealthProgramme: "workHealthProgramme",
  healthSafetyExecutive: "healthSafetyExecutive",
  notifyChangeAddress: "notifyChangeAddress",
  housingBenefit: "housingBenefit",
  housingAssociationHomes: "housingAssociationHomes",
  housingOmbudsman: "housingOmbudsman",
  getDigitalWallet: "getDigitalWallet",
};

// ===== categories =====

export const categories = {
  driving: "driving",
  health: "health",
  death: "death",
  birth: "birth",
  employment: "employment",
  housing: "housing",
  digitalWallet: "digital-wallet",
};

// ===== utils =====

type FlowState = {
  key: string | null;
  isStepValid: boolean;
};

/**
 * Returns a string based on a list of rules.
 *
 * Currently intended to be used to return an url slug depending on whatever
 * conditions desirable, enabling simple branching rules based on a state.
 *
 * Result is based on the order of the rules. If null or empty string is returned from the rule,
 * next rule will be tested.
 *
 */
export function getCurrentStep<TFlowData>(
  rules: ((data: TFlowData) => FlowState)[],
  state: TFlowData,
) {
  let next: FlowState = { key: null, isStepValid: false };
  for (const fn of rules) {
    if (next.key) {
      break;
    }
    next = fn(state);
  }
  return next;
}

export async function getFlowData<T extends Workflow>(
  flowKey: string,
  defaultData: T,
) {
  // Session details
  const { userId, email, firstName, lastName } = await PgSessions.get();

  const flowQuery = postgres.pgpool.query<{ data: Workflow }, [string, string]>(
    `
    SELECT
        flow_data AS "data"
    FROM user_flow_data
    WHERE user_id=$1
    AND flow=$2`,
    [userId, flowKey],
  );

  const flowResult = await flowQuery;

  const data = defaultData;

  if ("userName" in data) {
    data.userName = [firstName, lastName].join(" ");
  }

  if ("email" in data) {
    data.email = email;
  }

  if (flowResult.rowCount) {
    const [{ data: flowData }] = flowResult.rows;
    Object.assign(data, flowData);
  }

  return data;
}
