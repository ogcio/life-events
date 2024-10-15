import { AuthenticationFactory } from "../../../../libraries/authentication-factory";
import { PaymentRequest } from "../../../../types/common";
import { errorHandler, validateCustomAmount } from "../../../utils";

async function getAmountFromToken(token: string) {
  "use server";
  const paymentsApi = await AuthenticationFactory.getPaymentsClient();
  const { data: payload, error } = await paymentsApi.decodeToken({ token });

  if (error || !validateCustomAmount(payload?.data.amount)) errorHandler(error);

  return payload!.data.amount;
}

export async function getAmount({
  customAmount,
  token,
  prDetails,
}: {
  customAmount?: string;
  token?: string;
  prDetails: PaymentRequest;
}) {
  if (token && prDetails.allowAmountOverride) return getAmountFromToken(token);

  return prDetails.allowCustomAmount && customAmount
    ? parseFloat(customAmount)
    : prDetails.amount;
}
