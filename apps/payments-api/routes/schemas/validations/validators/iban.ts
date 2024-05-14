import { ValidatorFn } from ".";
import { getValidationPayload, ValidationKeywords } from "../utils";

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

const validate: ValidatorFn = (value, field, errors) => {
  const valid = ibanValidator(value);

  if (!valid) {
    errors.push(
      getValidationPayload(ValidationKeywords.INVALID, "IBAN is not valid", {
        field,
      }),
    );
  }

  return valid;
};

export default validate;
