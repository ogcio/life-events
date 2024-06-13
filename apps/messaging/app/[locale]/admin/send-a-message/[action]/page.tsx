import { notFound, redirect } from "next/navigation";
import { api } from "messages";
import { ApiMessageState, getCurrentStep } from "../../../../utils/messaging";
import { PgSessions } from "auth/sessions";
import ComposeMessageMeta from "./ComposeMessageMeta";
import ContentForm from "./ContentForm";
import EmailPreview from "./Preview";
import Recipients from "./Recipients";
import ScheduleForm from "./ScheduleForm";
import SuccessForm from "./SuccessForm";
import TemplateForm from "./TemplateForm";

import FlexMenuWrapper from "../../PageWithMenuFlexWrapper";

const metaSlug = "meta";
const contentSlug = "content";
const previewSlug = "preview";
const recipientsSlug = "recipients";
const scheduleSlug = "schedule";
const successSlug = "success";
const templateSlug = "template";

const next = { key: null, isStepValid: true };
const rules: Parameters<typeof getCurrentStep<ApiMessageState>>[0] = [
  // First meta selection step
  (state) =>
    Boolean(state.submittedMetaAt && state.templateMetaId)
      ? next
      : { key: metaSlug, isStepValid: true },

  // Template
  (state) =>
    Boolean(state.templateMetaId) && !Boolean(state.submittedContentAt)
      ? { key: templateSlug, isStepValid: true }
      : next,

  // Receients
  (state) => {
    if (state.confirmedRecipientsAt) {
      return next;
    }

    return { key: recipientsSlug, isStepValid: Boolean(state.userIds.length) };
  },

  // Schedule
  (state) =>
    Boolean(state.confirmedScheduleAt)
      ? next
      : { key: scheduleSlug, isStepValid: Boolean(state.schedule) },

  // Success
  () => ({ key: successSlug, isStepValid: true }),
];

const urlStateHandler = (url: string, key: string) => (Cmp: JSX.Element) => {
  if (url === key) {
    return <FlexMenuWrapper>{Cmp}</FlexMenuWrapper>;
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
    case metaSlug:
      return maybe(
        <ComposeMessageMeta
          state={state}
          userId={userId}
          stateId={stateId}
          disabledSubmit={!step.isStepValid}
        />,
      );
    case templateSlug:
      return maybe(
        <TemplateForm
          state={state}
          userId={userId}
          stateId={stateId}
          disabledSubmit={!step.isStepValid}
        />,
      );
    case contentSlug:
      return maybe(
        <ContentForm
          state={state}
          userId={userId}
          stateId={stateId}
          disabledSubmit={!step.isStepValid}
        />,
      );
    case previewSlug:
      return maybe(
        <EmailPreview
          state={state}
          userId={userId}
          stateId={stateId}
          disabledSubmit={!step.isStepValid}
        />,
      );
    case recipientsSlug:
      return maybe(
        <Recipients state={state} userId={userId} stateId={stateId} />,
      );
    case scheduleSlug:
      return maybe(
        <ScheduleForm state={state} userId={userId} stateId={stateId} />,
      );
    case successSlug:
      return maybe(
        <SuccessForm state={state} userId={userId} stateId={stateId} />,
      );
    default:
      throw notFound();
  }
};
