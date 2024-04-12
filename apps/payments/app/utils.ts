export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(amount / 100);
}

export function stringToAmount(amount: string) {
  return Math.round(parseFloat(amount) * 100);
}

// Generating the amount to pay based on the business rules of the application
export const getRealAmount = ({
  amount,
  customAmount,
  amountOverride,
  allowAmountOverride,
  allowCustomOverride,
}: {
  // Default amount required from the database
  amount: number;
  // Custom amount choosen by the user (if applicable)
  customAmount?: number;
  // Amount override from the URL (if applicable)
  amountOverride?: number;
  allowAmountOverride: boolean;
  allowCustomOverride: boolean;
}) => {
  if (allowAmountOverride && amountOverride) return amountOverride;
  if (allowCustomOverride && customAmount) return customAmount;

  return amount;
};

function mod97(str) {
  const first9 = str.substring(0, 9);
  const remainingStr = str.substring(9);
  const remainder = Number(first9) % 97;
  const newString = remainder.toString() + remainingStr;

  if (newString.length > 2) {
    return mod97(newString);
  }

  return remainder;
}

export const ibanValidator = (iban) => {
  const reorderedString = iban.substring(4) + iban.substring(0, 4);
  const replacedString = reorderedString.replaceAll(/[a-z]{1}/gi, (match) =>
    (match.toUpperCase().charCodeAt(0) - 55).toString(),
  );

  return mod97(replacedString) === 1;
};
