// Another idea could be to export these things from each component file, or add a const file eg. AddressForm.constants.ts, or export form AddressForm.tsx
export const driversConstants = {
  slug: {
    renewLicence: "renew-licence",
    confirmApplication: "confirm-application",
    newAddress: "new-address",
    changeDetails: "change-details",
    checkDetails: "check-details",
    proofOfAddress: "proof-of-address",
    paymentSelection: "payment-selection",
    paymentSuccess: "payment-success",
  },
  toDateString(year: string, month: string, day: string) {
    return year && month && day ? `${day}/${month}/${year}` : "";
  },
};
