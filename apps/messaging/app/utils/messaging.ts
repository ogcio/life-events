import { useTranslations } from "next-intl";
import { routes } from ".";
import { getTranslations } from "next-intl/server";
import { ComponentProps } from "react";
import ds from "design-system";

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
    icon: ComponentProps<typeof ds.Icon>["icon"];
  }[] = [];

  if (isAdminUser) {
    options.push(
      {
        key: routes.sendAMessage.slug,
        label: t("sendMessage"),
        url: routes.sendAMessage.slug,
        icon: "death",
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

// export type MessageState = {
//   messageId?: string;
//   submittedMetaAt: string; // First step of meta selection such as type, transportation eg.
//   sibmittedEmailAt: string;
//   confirmedEmailAt: string;
//   transportation: "email"[];
//   content: string;
//   subject: string;
//   abstract?: string; // Not entirely sure if this is needed
//   type: "message" | "event" | "newsletter";
//   links: { url: string; label: string }[];
//   schedule: "";
//   emailRecipients: string[];
//   confirmedEmailRecipientsAt: string;
//   confirmedScheduleAt: string;
// };

// export const emptyMessageState = (): MessageState => ({
//   content: "",
//   emailRecipients: [],
//   links: [],
//   schedule: "",
//   subject: "",
//   transportation: [],
//   type: "event",
//   submittedMetaAt: "",
//   sibmittedEmailAt: "",
//   confirmedEmailAt: "",
//   confirmedEmailRecipientsAt: "",
//   confirmedScheduleAt: "",
// });

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
