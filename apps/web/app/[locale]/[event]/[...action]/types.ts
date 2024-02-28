/**
 * Temporary home for some commonly shared types
 */

export type NextPageProps = {
  params: { event: string; action: string[]; locale: string };
  searchParams?: {
    [key: string]: string;
  };
};

// Base flow jsonb type. Always store entire object with blanks
// Add any property required for each step
export type RenewDriversLicenceFlow = {
  userName: string;
  sex: string;
  // Its just simpler not having to deal with dates since the design system has Year, month and day forms as standard.
  dayOfBirth: string;
  monthOfBirth: string;
  yearOfBirth: string;

  currentAddress: string;
  currentAddressVerified: string;
  timeAtAddress: string;
  email: string;
  mobile: string;
  paymentId: string;
  proofOfAddressRequest: string;
  totalFeePaid: string;
  dateOfPayment: string;
  confirmedApplication: string;
  successfulAt: string;
  rejectReason: string;
};

export function emptyRenewDriversLicenceFlow(): RenewDriversLicenceFlow {
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
    paymentId: "",
    proofOfAddressRequest: "",
    totalFeePaid: "",
    dateOfPayment: "",
    confirmedApplication: "",
    successfulAt: "",
    rejectReason: "",
  };
}
