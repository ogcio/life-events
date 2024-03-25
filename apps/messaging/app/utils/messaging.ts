import { useTranslations } from "next-intl";
import { routes } from ".";
import { getTranslations } from "next-intl/server";
import { ComponentProps } from "react";
import ds from "design-system";
import { api } from "messages";

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
        url: routes.sendAMessage.slug,
        type: "button",
      },
      {
        key: routes.emailTemplates.slug,
        label: t("emailTemplate"),
        url: routes.emailTemplates.slug,
        icon: "death",
      },
    );
  } else {
    options.push({
      key: routes.messages.slug,
      label: t("messages"),
      url: routes.messages.slug,
      icon: "death",
    });
  }
  options.push({
    key: routes.settings.slug,
    label: t("settings"),
    url: routes.settings.slug,
    icon: "about",
  });
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
