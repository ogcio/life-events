/**
 * A workflow is a series of forms or acknowledgements a user does to go through a life event.
 *
 * We store a state of the progress in a jsonb column. There's workflow with or without payments. All workflows
 * must derive from either Workflow types.
 */

// ===== Base =====
type Base = {
  rejectReason: string;
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
  };
}

// ===== utils =====

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
  rules: ((data: TFlowData) => string | null)[],
  state: TFlowData
) {
  let next: string | null = null;
  for (const fn of rules) {
    if (next) {
      break;
    }
    next = fn(state);
  }
  return next ?? "";
}
