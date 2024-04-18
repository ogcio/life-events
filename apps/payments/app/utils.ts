import { TransactionStatuses } from "../types/TransactionStatuses";

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

export const getValidationErrors = (
  validations: any[],
): Record<string, string> => {
  return validations.reduce((errors, validation) => {
    switch (validation.keyword) {
      case "invalid": {
        errors[validation.params.field] = validation.message;
      }
    }

    return errors;
  }, {});
};

export const mapTransactionStatusColorClassName = (status: string) => {
  switch (status) {
    case TransactionStatuses.Initiated:
      return "govie-tag--blue";
    case TransactionStatuses.Pending:
      return "govie-tag--yellow";
    case TransactionStatuses.Succeeded:
      return "govie-tag--green";
    case TransactionStatuses.Cancelled:
      return "govie-tag--red";
    case TransactionStatuses.Failed:
      return "govie-tag--red";
    default:
      return "";
  }
};
