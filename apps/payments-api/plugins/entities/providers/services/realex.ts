import { ProvidersRepo } from "../repo";
import { HttpErrors } from "@fastify/sensible";
import { getSecretFields } from "../dataMapper";
import secretsHandlerFactory from "../../../../services/providersSecretsService";
import {
  RealexHppResponseDO,
  RealexPaymentObjectDO,
  RealexStatusEnum,
  RealexStatusUpdateDO,
} from "../types";
import { RealexService } from "../../../../services/realexService";
import { TransactionStatusesEnum } from "../../transactions";

const buildGetPaymentObject =
  (repo: ProvidersRepo, httpErrors: HttpErrors) =>
  async (
    providerId: string,
    amount: string,
    intentId: string,
  ): Promise<RealexPaymentObjectDO> => {
    const providerResult = await repo.getProviderById(providerId);

    const provider = providerResult.rows[0];
    if (!provider) throw httpErrors.notFound("Provider not found");

    if (provider.status !== "connected") {
      throw httpErrors.unprocessableEntity("Provider is not enabled");
    }

    const secretFields = getSecretFields("realex", provider.data);
    const { merchantId, sharedSecret } = secretsHandlerFactory
      .getInstance()
      .getClearTextData(provider.data, secretFields);

    const currency = "EUR";
    const url =
      process.env.REALEX_PAYMENT_URL ??
      "https://pay.sandbox.realexpayments.com/pay";
    const realexService = new RealexService(sharedSecret);
    const timestamp = realexService.generateTimestamp();
    const hash = realexService.generateHash(
      [timestamp, merchantId, intentId, amount, currency].join("."),
    );

    const result = {
      ACCOUNT: process.env.REALEX_PAYMENT_ACCOUNT ?? "internet",
      AMOUNT: amount,
      CURRENCY: currency,
      MERCHANT_ID: merchantId,
      ORDER_ID: intentId,
      TIMESTAMP: timestamp,
      URL: url,
      SHA256HASH: hash,
    };

    return result;
  };

const buildVerifyPaymentResponse =
  (repo: ProvidersRepo, httpErrors: HttpErrors) =>
  async (body: RealexHppResponseDO, providerId: string): Promise<string> => {
    const providerResult = await repo.getProviderById(providerId);
    const provider = providerResult.rows[0];
    if (!provider) throw httpErrors.notFound("Provider not found");

    if (provider.status !== "connected") {
      throw httpErrors.unprocessableEntity("Provider is not enabled");
    }

    const secretFields = getSecretFields("realex", provider.data);
    const { sharedSecret } = secretsHandlerFactory
      .getInstance()
      .getClearTextData(provider.data, secretFields);

    const realexService = new RealexService(sharedSecret);
    const isResponseValid = realexService.verifyHash(body);
    if (!isResponseValid) {
      throw httpErrors.unprocessableEntity(
        "Payment response contains untrusted data",
      );
    }

    return realexService.generateHTMLResponse(body);
  };

const buildVerifyPaymentStatusUpdate =
  (repo: ProvidersRepo, httpErrors: HttpErrors) =>
  async (
    params: RealexStatusUpdateDO,
    providerId: string,
  ): Promise<boolean> => {
    const providerResult = await repo.getProviderById(providerId);
    const provider = providerResult.rows[0];
    if (!provider) throw httpErrors.notFound("Provider not found");

    if (provider.status !== "connected") {
      throw httpErrors.unprocessableEntity("Provider is not enabled");
    }

    const secretFields = getSecretFields("realex");
    const { sharedSecret } = secretsHandlerFactory
      .getInstance()
      .getClearTextData(provider.data, secretFields);

    const realexService = new RealexService(sharedSecret);
    const isResponseValid = realexService.verifyStatusUpdateHash(params);
    if (!isResponseValid) {
      throw httpErrors.unprocessableEntity(
        "Payment response contains untrusted data",
      );
    }

    return true;
  };

const getTransactionStatus = (
  result: RealexStatusEnum,
): TransactionStatusesEnum => {
  switch (result) {
    case RealexStatusEnum.SUCCESSFUL:
      return TransactionStatusesEnum.Succeeded;
    case RealexStatusEnum.PENDING:
    case RealexStatusEnum.UNKNOWN:
      return TransactionStatusesEnum.Pending;
    case RealexStatusEnum.DECLINED:
    case RealexStatusEnum.INSUFFICIENT_FUNDS:
    case RealexStatusEnum.FAILURE:
    case RealexStatusEnum.VARIOUS_FAILURE:
      return TransactionStatusesEnum.Failed;
    default:
      return TransactionStatusesEnum.Pending;
  }
};

export default function buildRealex(
  repo: ProvidersRepo,
  httpErrors: HttpErrors,
) {
  return {
    getPaymentObject: buildGetPaymentObject(repo, httpErrors),
    verifyPaymentResponse: buildVerifyPaymentResponse(repo, httpErrors),
    verifyPaymentStatusUpdate: buildVerifyPaymentStatusUpdate(repo, httpErrors),
    getTransactionStatus,
  };
}
