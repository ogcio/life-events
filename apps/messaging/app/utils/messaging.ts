import { routes } from ".";
import { getTranslations } from "next-intl/server";
import { ComponentProps } from "react";
import ds from "design-system";
import { api } from "messages";
import { providerRoutes } from "./routes";

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
        key: "providers",
        label: t("providers"),
        url: providerRoutes.url,
        icon: "settings",
      },
    );
  } else {
    options.push({
      key: routes.messages.slug,
      label: t("messages"),
      url: routes.messages.slug,
      icon: "events",
    });
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
export type MessageCreateProps = {
  state: ApiMessageState;
  userId: string;
  stateId?: string;
  disabledSubmit?: boolean;
};
