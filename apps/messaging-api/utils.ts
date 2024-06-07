import { HttpErrors } from "@fastify/sensible";

export const organisationId = "45ed3f88-d091-4f3d-87bc-93777c297ab6";

export type HttpError = Pick<HttpErrors["HttpError"], "statusCode" | "message">;
export type ServiceError = { error: object; msg: string; critical: boolean };

type AwsSmsProviderConfig = {
  secretAccessKey: string;
  accessKey: string;
  type: "AWS";
};

export const utils = {
  interpolationReducer: function (interpolations: Record<string, string>) {
    return function reducer(acc: string, key: string) {
      return acc.replaceAll(`{{${key}}}`, interpolations[key]);
    };
  },
  templateFilter: function templateFilter(languagesToConsider: Set<string>) {
    return function templateFilter(template: {
      subject: string;
      excerpt: string;
      richText: string;
      plainText: string;
      lang: string;
    }) {
      return languagesToConsider.has(template.lang);
    };
  },
  reduceUserLang: function reduceUserLang(
    acc: Set<string>,
    user: {
      id: string;
      email: string;
      lang: string;
    },
  ) {
    acc.add(user.lang);
    return acc;
  },
  postgresArrayify: function postgresArrayify(arr: unknown[]): string {
    return JSON.stringify(arr).replace("[", "{").replace("]", "}");
  },
  buildApiError: function buildApiError(
    message: string,
    statusCode: number,
  ): HttpError {
    return {
      message,
      statusCode,
    };
  },
  isSmsAwsConfig(config: unknown): config is AwsSmsProviderConfig {
    const check = config as AwsSmsProviderConfig;
    return Boolean(
      check?.type === "AWS" &&
        "accessKey" in check &&
        "secretAccessKey" in check,
    );
  },
  isError(error: unknown): error is Error {
    return error instanceof Error;
  },
};
