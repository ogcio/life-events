import { notFound, redirect } from "next/navigation";
import { api } from "messages";
import { ApiMessageState, getCurrentStep } from "../../../utils/messaging";

import { PgSessions } from "auth/sessions";
import { revalidatePath } from "next/cache";
import dayjs from "dayjs";
import ComposeMessageMeta from "./ComposeMessageMeta";
import EmailForm from "./EmailForm";
import EmailPreview from "./EmailPreview";
import EmailRecipients from "./EmailRecipients";
import ScheduleForm from "./ScheduleForm";
import SuccessForm from "./SuccessForm";

const next = { key: null, isStepValid: true };
const rules: Parameters<typeof getCurrentStep<ApiMessageState>>[0] = [
  // First meta selection step
  (state) =>
    Boolean(state.submittedMetaAt) ? next : { key: "meta", isStepValid: true },

  // All transportation steps
  (state) => {
    // if (!state.transportation.length) {
    //   return next;
    // }
    for (const transportation of state.transportations) {
      if (transportation === "email") {
        // Completed email details form?
        if (!state.submittedEmailAt) {
          return {
            key: "email",
            isStepValid: Boolean(state.subject && state.content),
          };
        }

        // Confirmed email preview?
        if (!state.confirmedEmailAt) {
          return { key: "email-preview", isStepValid: true };
        }

        // Added all recipients
        if (!state.confirmedEmailRecipientsAt) {
          return {
            key: "email-recipients",
            isStepValid: Boolean(state.emailRecipients.length),
          };
        }
      }

      // if asd == sms ... eg
    }

    return next;
  },

  // Schedule
  (state) =>
    Boolean(state.confirmedScheduleAt)
      ? next
      : { key: "schedule", isStepValid: Boolean(state.schedule) },

  // Success
  () => ({ key: "success", isStepValid: true }),
];

const urlStateHandler = (url: string, key: string) => (Cmp: JSX.Element) => {
  if (url === key) {
    return Cmp;
  }
  redirect(key);
};

export default async (props: {
  params: { action: string };
  searchParams: { state_id: string };
}) => {
  const { userId } = await PgSessions.get();
  const urlAction = props.params.action;
  const { state, id: stateId } = await api.getMessageState(userId);
  const step = getCurrentStep<ApiMessageState>(rules, state);
  const maybe = urlStateHandler(urlAction, step.key || "");
  switch (step.key) {
    case "meta":
      return maybe(
        <ComposeMessageMeta
          state={state}
          userId={userId}
          stateId={stateId}
          disabledSubmit={!step.isStepValid}
        />,
      );
    case "email":
      return maybe(
        <EmailForm
          state={state}
          userId={userId}
          stateId={stateId}
          disabledSubmit={!step.isStepValid}
        />,
      );
    case "email-preview":
      return maybe(
        <EmailPreview
          state={state}
          userId={userId}
          stateId={stateId}
          disabledSubmit={!step.isStepValid}
        />,
      );
    case "email-recipients":
      return maybe(
        <EmailRecipients state={state} userId={userId} stateId={stateId} />,
      );
    case "schedule":
      return maybe(
        <ScheduleForm state={state} userId={userId} stateId={stateId} />,
      );
    case "success":
      return maybe(
        <SuccessForm state={state} userId={userId} stateId={stateId} />,
      );
    default:
      throw notFound();
  }
};
