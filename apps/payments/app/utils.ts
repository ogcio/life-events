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
