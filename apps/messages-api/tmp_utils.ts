import { HttpErrors } from "@fastify/sensible";

export type OurHttpError = Pick<
  HttpErrors["HttpError"],
  "statusCode" | "message"
>;

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
};
