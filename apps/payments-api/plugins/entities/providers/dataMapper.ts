import { ProviderTypes } from "./types";

/**
 * Each IBAN contains a check digit calculated individually by the bank for the
 * account holder. This check digit makes it easy to recognize typing errors or
 * numbers when entering and processing the IBAN. The principle is always the
 * same: A mathematical operation processes all available numbers and digits
 * and uses a defined procedure to calculate one or more check digits. For the
 * IBAN, the Modulo 97 method is used for the check digit calculation.
 *
 * The following steps are performed:
 *
 * 1) the first four characters of the IBAN number are pulled out from the
 *  beginning and are appended at the end of the string.
 * 2) All the letters in the hence obtained string of characters are replaced
 *  by the ASCII value of their corresponding uppercase letter decreased by 55.
 *  (ascii value −55)
 * 3) The modulus of the hence obtained number, let's say 𝑥, with respect to 97
 *  is checked.
 * 4) If the modulus is 1, then it's a valid IBAN number
 */
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
      return ibanValidator(value);
    default:
      return true;
  }
};

export const mapProviderData = (
  data: Record<string, string>,
  type: ProviderTypes,
) => {
  return Object.entries(providersDataMap[type]).reduce<
    [
      Record<string, string>,
      Array<{ field: string; error: ProviderDataErrors }>,
    ]
  >(
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
    [{}, []],
  );
};

export const getSecretFields = (type: ProviderTypes) => {
  return Object.entries(providersDataMap[type]).reduce<Array<string>>(
    (acc, curr) => {
      const [key, props] = curr;

      if (props.isSecret) {
        acc.push(key);
      }

      return acc;
    },
    [],
  );
};
