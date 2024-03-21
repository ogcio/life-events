export const events = { slug: "events" };
export const aboutMe = { slug: "about-me" };
export const birth = { slug: "birth" };

export const health = {
  slug: "health",
  orderEHIC: {
    slug: "order-ehic",
    path() {
      return `${health.slug}/${health.orderEHIC.slug}`;
    },
    checkDetails: {
      slug: "check-details",
      path() {
        return `${health.slug}/${health.orderEHIC.slug}/${health.orderEHIC.checkDetails.slug}`;
      },
    },
    changeDetails: {
      slug: "change-details",
      path() {
        return `${health.slug}/${health.orderEHIC.slug}/${health.orderEHIC.changeDetails.slug}`;
      },
    },
    newAddress: {
      slug: "new-address",
      path() {
        return `${health.slug}/${health.orderEHIC.slug}/${health.orderEHIC.newAddress.slug}`;
      },
    },
    proofOfAddress: {
      slug: "proof-of-address",
      path() {
        return `${health.slug}/${health.orderEHIC.slug}/${health.orderEHIC.proofOfAddress.slug}`;
      },
    },
    selectLocalHealthOffice: {
      slug: "select-health-office",
      path() {
        return `${health.slug}/${health.orderEHIC.slug}/${health.orderEHIC.selectLocalHealthOffice.slug}`;
      },
    },
    dispatchAddress: {
      slug: "dispatch-address",
      path() {
        return `${health.slug}/${health.orderEHIC.slug}/${health.orderEHIC.dispatchAddress.slug}`;
      },
    },
    applicationSuccess: {
      slug: "application-success",
      path() {
        return `${health.slug}/${health.orderEHIC.slug}/${health.orderEHIC.applicationSuccess.slug}`;
      },
    },
  },
  orderBirthCertificate: {
    slug: "order-birth-certificate",
    path() {
      return `${health.slug}/${health.orderBirthCertificate.slug}`;
    },
    checkDetails: {
      slug: "check-details",
      path() {
        return `${health.slug}/${health.orderBirthCertificate.slug}/${health.orderBirthCertificate.checkDetails.slug}`;
      },
    },
    changeDetails: {
      slug: "change-details",
      path() {
        return `${health.slug}/${health.orderBirthCertificate.slug}/${health.orderBirthCertificate.changeDetails.slug}`;
      },
    },
    newAddress: {
      slug: "new-address",
      path() {
        return `${health.slug}/${health.orderBirthCertificate.slug}/${health.orderBirthCertificate.newAddress.slug}`;
      },
    },
    proofOfAddress: {
      slug: "proof-of-address",
      path() {
        return `${health.slug}/${health.orderBirthCertificate.slug}/${health.orderBirthCertificate.proofOfAddress.slug}`;
      },
    },
    applicationSuccess: {
      slug: "application-success",
      path() {
        return `${health.slug}/${health.orderBirthCertificate.slug}/${health.orderBirthCertificate.applicationSuccess.slug}`;
      },
    },
  },
};

export const driving = {
  slug: "driving",
  renewDriversLicence: {
    paymentError: { slug: "payment-error" },
    slug: "renew-licence",
    path() {
      return `${driving.slug}/${driving.renewDriversLicence.slug}`;
    },
    confirmApplication: {
      slug: "confirm-application",
      path() {
        return `${driving.slug}/${driving.renewDriversLicence.slug}/${driving.renewDriversLicence.confirmApplication.slug}`;
      },
    },
    newAddress: {
      slug: "new-address",
      path() {
        return `${driving.slug}/${driving.renewDriversLicence.slug}/${driving.renewDriversLicence.newAddress.slug}`;
      },
    },
    changeDetails: {
      slug: "change-details",
      path() {
        return `${driving.slug}/${driving.renewDriversLicence.slug}/${driving.renewDriversLicence.changeDetails.slug}`;
      },
    },
    proofOfAddress: {
      slug: "proof-of-address",
      path() {
        return `${driving.slug}/${driving.renewDriversLicence.slug}/${driving.renewDriversLicence.proofOfAddress.slug}`;
      },
    },
    paymentSelection: {
      slug: "payment-selection",
      path() {
        return `${driving.slug}/${driving.renewDriversLicence.slug}/${driving.renewDriversLicence.paymentSelection.slug}`;
      },
    },
    paymentSuccess: {
      slug: "payment-success",
      path() {
        return `${driving.slug}/${driving.renewDriversLicence.slug}/${driving.renewDriversLicence.paymentSuccess.slug}`;
      },
    },
    applicationSuccess: {
      slug: "application-success",
      path() {
        return `${driving.slug}/${driving.renewDriversLicence.slug}/${driving.renewDriversLicence.applicationSuccess.slug}`;
      },
    },
    medicalCertificate: {
      slug: "medical-certificate",
      path() {
        return `${driving.slug}/${driving.renewDriversLicence.slug}/${driving.renewDriversLicence.medicalCertificate.slug}`;
      },
    },
    complete: {
      slug: "complete",
    },
  },
};
export const employment = {
  slug: "employment",
  applyJobseekersAllowance: {
    slug: "apply-jobseekers-allowance",
    path() {
      return `${employment.slug}/${employment.applyJobseekersAllowance.slug}`;
    },
    introduction: {
      slug: "introduction",
      path() {
        return `${employment.slug}/${employment.applyJobseekersAllowance.slug}/${employment.applyJobseekersAllowance.introduction.slug}`;
      },
    },
    benefitsEntitlements: {
      slug: "benefits-entitlements",
      path() {
        return `${employment.slug}/${employment.applyJobseekersAllowance.slug}/${employment.applyJobseekersAllowance.benefitsEntitlements.slug}`;
      },
    },
    apply: {
      slug: "apply-jobseekers-allowance",
      path() {
        return `${employment.slug}/${employment.applyJobseekersAllowance.slug}/${employment.applyJobseekersAllowance.apply.slug}`;
      },
    },
    rates: {
      slug: "rates",
      path() {
        return `${employment.slug}/${employment.applyJobseekersAllowance.slug}/${employment.applyJobseekersAllowance.rates.slug}`;
      },
    },
    questions: {
      slug: "what-asked-about",
      path() {
        return `${employment.slug}/${employment.applyJobseekersAllowance.slug}/${employment.applyJobseekersAllowance.questions.slug}`;
      },
    },
    confirmDetails: {
      slug: "confirm-details",
      path() {
        return `${employment.slug}/${employment.applyJobseekersAllowance.slug}/${employment.applyJobseekersAllowance.confirmDetails.slug}`;
      },
    },
    changeDetails: {
      slug: "change-details",
      path() {
        return `${employment.slug}/${employment.applyJobseekersAllowance.slug}/${employment.applyJobseekersAllowance.changeDetails.slug}`;
      },
    },
  },
};
export const business = { slug: "business" };
export const housing = { slug: "housing" };
export const death = {
  slug: "death",
  notifyDeath: {
    slug: "notify-death",
    path() {
      return `${death.slug}/${death.notifyDeath.slug}`;
    },
    requiredInformation: {
      slug: "required-information",
      path() {
        return `${death.slug}/${death.notifyDeath.slug}/${death.notifyDeath.requiredInformation.slug}`;
      },
    },
    authorityCheck: {
      slug: "authority",
      path() {
        return `${death.slug}/${death.notifyDeath.slug}/${death.notifyDeath.authorityCheck.slug}`;
      },
    },
    details: {
      slug: "enter-details",
      path() {
        return `${death.slug}/${death.notifyDeath.slug}/${death.notifyDeath.details.slug}`;
      },
    },
    confirmNotification: {
      slug: "confirm-notification",
      path() {
        return `${death.slug}/${death.notifyDeath.slug}/${death.notifyDeath.confirmNotification.slug}`;
      },
    },
    servicesToInform: {
      slug: "services-list-to-inform",
      path() {
        return `${death.slug}/${death.notifyDeath.slug}/${death.notifyDeath.servicesToInform.slug}`;
      },
    },
    notificationSuccess: {
      slug: "notification-success",
      path() {
        return `${death.slug}/${death.notifyDeath.slug}/${death.notifyDeath.notificationSuccess.slug}`;
      },
    },
  },
};

export const category = {
  health,
  driving,
  death,
  employment,
};
