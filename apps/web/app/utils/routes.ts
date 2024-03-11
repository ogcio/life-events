export const events = { slug: "events" };
export const aboutMe = { slug: "about-me" };
export const birth = { slug: "birth" };
export const health = { slug: "health" };
export const driving = {
  slug: "driving",
  renewLicense: {
    paymentError: { slug: "payment-error" },
    slug: "renew-licence",
    path() {
      return `${driving.slug}/${driving.renewLicense.slug}`;
    },
    confirmApplication: {
      slug: "confirm-application",
      path() {
        return `${driving.slug}/${driving.renewLicense.slug}/${driving.renewLicense.confirmApplication.slug}`;
      },
    },
    newAddress: {
      slug: "new-address",
      path() {
        return `${driving.slug}/${driving.renewLicense.slug}/${driving.renewLicense.newAddress.slug}`;
      },
    },
    changeDetails: {
      slug: "change-details",
      path() {
        return `${driving.slug}/${driving.renewLicense.slug}/${driving.renewLicense.changeDetails.slug}`;
      },
    },
    proofOfAddress: {
      slug: "proof-of-address",
      path() {
        return `${driving.slug}/${driving.renewLicense.slug}/${driving.renewLicense.proofOfAddress.slug}`;
      },
    },
    paymentSelection: {
      slug: "payment-selection",
      path() {
        return `${driving.slug}/${driving.renewLicense.slug}/${driving.renewLicense.paymentSelection.slug}`;
      },
    },
    paymentSuccess: {
      slug: "payment-success",
      path() {
        return `${driving.slug}/${driving.renewLicense.slug}/${driving.renewLicense.paymentSuccess.slug}`;
      },
    },
    applicationSuccess: {
      slug: "application-success",
      path() {
        return `${driving.slug}/${driving.renewLicense.slug}/${driving.renewLicense.applicationSuccess.slug}`;
      },
    },
    medicalCertificate: {
      slug: "medical-certificate",
      path() {
        return `${driving.slug}/${driving.renewLicense.slug}/${driving.renewLicense.medicalCertificate.slug}`;
      },
    },
    complete: {
      slug: "complete",
    },
  },
};
export const employment = { slug: "employment" };
export const business = { slug: "business" };
export const housing = { slug: "housing" };
export const death = { slug: "death" };
