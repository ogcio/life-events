import { ValidationErrorTypes, ValidationFieldMap } from "./utils";

export const bankTransferValidationMap = (t): ValidationFieldMap => {
  return {
    name: {
      field: "providerName",
      errorMessage: {
        [ValidationErrorTypes.REQUIRED]: t("nameRequired"),
      },
    },
    iban: {
      field: "iban",
      errorMessage: {
        [ValidationErrorTypes.REQUIRED]: t("ibanRequired"),
        [ValidationErrorTypes.INVALID]: t("ibanInvalid"),
      },
    },
    accountHolderName: {
      field: "accountHolderName",
      errorMessage: {
        [ValidationErrorTypes.REQUIRED]: t("accountHolderNameRequired"),
      },
    },
  };
};

export const openBankingValidationMap = (t): ValidationFieldMap => {
  return {
    name: {
      field: "providerName",
      errorMessage: {
        [ValidationErrorTypes.REQUIRED]: t("nameRequired"),
      },
    },
    iban: {
      field: "iban",
      errorMessage: {
        [ValidationErrorTypes.REQUIRED]: t("ibanRequired"),
        [ValidationErrorTypes.INVALID]: t("ibanInvalid"),
      },
    },
    accountHolderName: {
      field: "accountHolderName",
      errorMessage: {
        [ValidationErrorTypes.REQUIRED]: t("accountHolderNameRequired"),
      },
    },
  };
};

export const realexValidationMap = (t): ValidationFieldMap => {
  return {
    name: {
      field: "providerName",
      errorMessage: {
        [ValidationErrorTypes.REQUIRED]: t("nameRequired"),
      },
    },
    merchantId: {
      field: "merchantId",
      errorMessage: {
        [ValidationErrorTypes.REQUIRED]: t("merchantIdRequired"),
      },
    },
    sharedSecret: {
      field: "sharedSecret",
      errorMessage: {
        [ValidationErrorTypes.REQUIRED]: t("sharedSecretRequired"),
      },
    },
  };
};

export const stripeValidationMap = (t): ValidationFieldMap => {
  return {
    name: {
      field: "providerName",
      errorMessage: {
        [ValidationErrorTypes.REQUIRED]: t("nameRequired"),
      },
    },
    liveSecretKey: {
      field: "liveSecretKey",
      errorMessage: {
        [ValidationErrorTypes.REQUIRED]: t("liveSecretKeyRequired"),
      },
    },
    livePublishableKey: {
      field: "livePublishableKey",
      errorMessage: {
        [ValidationErrorTypes.REQUIRED]: t("livePublishableKeyRequired"),
      },
    },
  };
};

export const paymentRequestValidationMap = (t): ValidationFieldMap => {
  return {
    title: {
      field: "title",
      errorMessage: {
        [ValidationErrorTypes.REQUIRED]: t("titleRequired"),
      },
    },
    reference: {
      field: "reference",
      errorMessage: {
        [ValidationErrorTypes.REQUIRED]: t("referenceRequired"),
      },
    },
    amount: {
      field: "amount",
      errorMessage: {
        [ValidationErrorTypes.MINIMUM]: t("amountRequired"),
      },
    },
    redirectUrl: {
      field: "redirectUrl",
      errorMessage: {
        [ValidationErrorTypes.REQUIRED]: t("redirectUrlRequired"),
      },
    },
  };
};
