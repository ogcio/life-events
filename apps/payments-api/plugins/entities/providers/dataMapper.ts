import { ProviderTypes } from "./types";

function mod97(str: string) {
  const first9 = str.substring(0, 9);
  const remainingStr = str.substring(9);
  const remainder = Number(first9) % 97;
  const newString = remainder.toString() + remainingStr;

  if (newString.length > 2) {
    return mod97(newString);
  }

  return remainder;
}

function ibanValidator(iban: string) {
  const reorderedString = iban.substring(4) + iban.substring(0, 4);
  const replacedString = reorderedString.replaceAll(/[a-z]{1}/gi, (match) =>
    (match.toUpperCase().charCodeAt(0) - 55).toString(),
  );

  return mod97(replacedString) === 1;
}

export enum ProviderDataErrors {
  MISSING = "missing",
  INVALID = "invalid",
}

export const providersDataMap = {
  banktransfer: {
    iban: {
      type: "iban",
      required: true,
      isSecret: false,
    },
    accountHolderName: {
      type: "text",
      required: true,
      isSecret: false,
    },
  },
  openbanking: {
    iban: {
      type: "iban",
      required: true,
      isSecret: false,
    },
    accountHolderName: {
      type: "text",
      required: true,
      isSecret: false,
    },
  },
  stripe: {
    livePublishableKey: {
      type: "text",
      required: true,
      isSecret: false,
    },
    liveSecretKey: {
      type: "text",
      required: true,
      isSecret: true,
    },
  },
  realex: {
    merchantId: {
      type: "text",
      required: true,
      isSecret: false,
    },
    sharedSecret: {
      type: "text",
      required: true,
      isSecret: true,
    },
  },
  worldpay: {
    merchantCode: {
      type: "text",
      required: true,
      isSecret: true,
    },
    installationId: {
      type: "text",
      required: true,
      isSecret: false,
    },
  },
};

const validateDataValue = (value: any, type: string) => {
  switch (type) {
    case "iban":
      console.log(">>>>>>", value, ibanValidator("IE29AIBK93115212345678"));
      console.log(">>>>>>", value, ibanValidator("IE29AIBK93115212345679"));
      return ibanValidator(value);
    default:
      return true;
  }
};

export const mapProviderData = (
  data: Record<string, string>,
  type: ProviderTypes,
) => {
  return Object.entries(providersDataMap[type]).reduce(
    (acc, curr) => {
      const [key, props] = curr;
      const [dataObj, errors] = acc;

      if (!data[key] && props.required) {
        errors.push({
          field: key,
          error: ProviderDataErrors.MISSING,
        });

        return acc;
      }

      if (!validateDataValue(data[key], props.type)) {
        errors.push({
          field: key,
          error: ProviderDataErrors.INVALID,
        });

        return acc;
      }

      dataObj[key] = data[key];

      return acc;
    },
    [{}, []] as [
      Record<string, string>,
      Array<{ field: string; error: ProviderDataErrors }>,
    ],
  );
};

export const getSecretFields = (type: ProviderTypes) => {
  return Object.entries(providersDataMap[type]).reduce((acc, curr) => {
    const [key, props] = curr;

    if (props.isSecret) {
      acc.push(key);
    }

    return acc;
  }, [] as Array<string>);
};
