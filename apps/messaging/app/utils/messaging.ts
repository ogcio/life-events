import { routes } from ".";
import { getTranslations } from "next-intl/server";
import { ComponentProps } from "react";
import ds from "design-system";
import { api } from "messages";
import { providerRoutes, users, usersImports } from "./routes";

export const languages = {
  EN: "EN",
  GA: "GA",
} as const;

export const sideMenuOptions = async (isAdminUser: boolean) => {
  const t = await getTranslations("SideMenu");
  const options: {
    key: string;
    label: string;
    url: string;
    icon?: ComponentProps<typeof ds.Icon>["icon"];
    type?: "button";
  }[] = [];

  if (isAdminUser) {
    options.push(
      {
        key: routes.sendAMessage.slug,
        label: t("sendMessage"),
        url: routes.sendAMessage.url,
        icon: "send-a-message",
      },
      {
        key: routes.messageTemplates.slug,
        label: t("templates"),
        url: routes.messageTemplates.url,
        icon: "template",
      },
      {
        key: providerRoutes.slug,
        label: t("providers"),
        url: providerRoutes.url,
        icon: "settings",
      },
      {
        key: users.slug,
        label: t("users"),
        url: users.url,
        icon: "employment",
      },
    );
  } else {
    options.push(
      {
        key: routes.messages.slug,
        label: t("messages"),
        url: routes.messages.slug,
        icon: "events",
      },
      {
        key: routes.usersSettingsRoutes.slug,
        label: t("userSettings"),
        url: routes.usersSettingsRoutes.url,
        icon: "about",
      },
    );
  }
  return options;
};

/**
 * Taken from the life event portal app. I think this concept could be centralised.
 */
type FlowState = {
  key: string | null;
  isStepValid: boolean;
};
export function getCurrentStep<TFlowData>(
  rules: ((data: TFlowData) => FlowState)[],
  state: TFlowData,
) {
  let next: FlowState = { key: null, isStepValid: false };
  for (const fn of rules) {
    if (next.key) {
      break;
    }
    next = fn(state);
  }
  return next;
}

export type ApiMessageState = Parameters<typeof api.upsertMessageState>[0];
export type EventTableSearchParams = {
  page: string;
  offset: string;
  baseUrl: string;
  limit: string;
};
export type MessageCreateProps = {
  state: ApiMessageState;
  userId: string;
  stateId?: string;
  disabledSubmit?: boolean;
  searchParams?: EventTableSearchParams;
};

export const searchKeyProvider = "provider";
export const searchValueEmail = "email";
export const searchValueSms = "sms";
export const searchKeyDeleteId = "deleteId";
export const searchValueOrganisation = "organisation";
export const searchKeySettingType = "settingType";
export const searchValueImports = "imports";
export const searchValueImportCsv = "importCsv";
export const searchValueUsers = "users";
export const searchKeyListType = "listType";
export const envUAT = "UAT";
export const envDevelopment = "DEV";
export const envStaging = "STA";
export const envProduction = "PRD";

export const getLinks = (
  environment: string,
  locale: string,
): { feedbackLink: URL; homePageUrl: URL; learnMoreForm: URL } => {
  locale = locale || "en";
  const nonProdFeedbackLink = new URL(
    `${locale}/664c61ba5f7c9800231db294`,
    "https://www.formsg.testing.gov.ie",
  );
  const nonProdLearnMoreForm = new URL(
    `${locale}/664b6de45f7c9800231daf22`,
    "https://www.formsg.testing.gov.ie",
  );

  switch (environment) {
    case envUAT:
      return {
        homePageUrl: new URL("", "https://uat.blocks.gov.ie"),
        feedbackLink: nonProdFeedbackLink,
        learnMoreForm: nonProdLearnMoreForm,
      };
    case envStaging:
      return {
        homePageUrl: new URL("", "https://sta.blocks.gov.ie"),
        feedbackLink: nonProdFeedbackLink,
        learnMoreForm: nonProdLearnMoreForm,
      };
    case envDevelopment:
      return {
        homePageUrl: new URL("", "https://dev.blocks.gov.ie"),
        feedbackLink: nonProdFeedbackLink,
        learnMoreForm: nonProdLearnMoreForm,
      };
    case envProduction:
    default:
      return {
        feedbackLink: new URL(
          `${locale}/664ccbdb0700c50024c53899`,
          "https://www.forms.gov.ie",
        ),
        homePageUrl: new URL("", "https://blocks.gov.ie"),
        learnMoreForm: new URL(
          `${locale}/664ccbf2b644d000246cfd78`,
          "https://www.forms.gov.ie",
        ),
      };
  }
};

/**
 * Checks for all values inside double curly brackets
 *
 * eg. {{value}} => ["value"]
 */
export function getInterpolationValues(text: string): string[] {
  return text.match(/[^{{]+(?=}})/g) || [];
}

export const avaliableMessagingTemplateStaticVariables = new Set([
  "firstName",
  "lastName",
  "phone",
  "email",
  "ppsn",
]);

export const AVAILABLE_TRANSPORTS = ["sms", "email", "lifeEvent"] as const;

export function isAvailableTransport(
  t: string,
): t is (typeof AVAILABLE_TRANSPORTS)[number] {
  return AVAILABLE_TRANSPORTS.some((at) => at === t);
}
