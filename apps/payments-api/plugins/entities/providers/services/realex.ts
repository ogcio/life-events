import { ProvidersRepo } from "../repo";
import { HttpErrors } from "@fastify/sensible";
import { getSecretFields } from "../dataMapper";
import secretsHandlerFactory from "../../../../services/providersSecretsService";
import { RealexHppResponseDO, RealexPaymentObjectDO } from "../types";
import { RealexService } from "../../../../services/realexService";

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

    const secretFields = getSecretFields("realex");
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

    const secretFields = getSecretFields("realex");
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

export default function buildRealex(
  repo: ProvidersRepo,
  httpErrors: HttpErrors,
) {
  return {
    getPaymentObject: buildGetPaymentObject(repo, httpErrors),
    verifyPaymentResponse: buildVerifyPaymentResponse(repo, httpErrors),
  };
}
