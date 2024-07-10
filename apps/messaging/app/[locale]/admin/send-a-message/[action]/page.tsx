import { notFound, redirect } from "next/navigation";
import { api } from "messages";
import {
  ApiMessageState,
  MessageCreateSearchParams,
  getCurrentStep,
} from "../../../../utils/messaging";
import ComposeMessageMeta from "./ComposeMessageMeta";
import ContentForm from "./ContentForm";
import EmailPreview from "./Preview";
import Recipients from "./Recipients";
import ScheduleForm from "./ScheduleForm";
import SuccessForm from "./SuccessForm";
import TemplateForm from "./TemplateForm";
import FlexMenuWrapper from "../../PageWithMenuFlexWrapper";
import {
  PAGINATION_LIMIT_DEFAULT,
  PAGINATION_OFFSET_DEFAULT,
  PAGINATION_PAGE_DEFAULT,
} from "../components/paginationUtils";
import { sendAMessage } from "../../../../utils/routes";
import { AuthenticationContextFactory } from "auth/authentication-context-factory";
import { withContext } from "../../../with-context";

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

  // Recipients
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

export default withContext(
  async (props: {
    params: { action: string };
    searchParams: { state_id: string } & Partial<MessageCreateSearchParams>;
  }) => {
    const user = await AuthenticationContextFactory.getUser();
    const urlAction = props.params.action;
    const { state, id: stateId } = await api.getMessageState(user.id);
    const step = getCurrentStep<ApiMessageState>(rules, state);
    const maybe = urlStateHandler(urlAction, step.key || "");
    switch (step.key) {
      case metaSlug:
        return maybe(
          <ComposeMessageMeta
            state={state}
            userId={user.id}
            stateId={stateId}
            disabledSubmit={!step.isStepValid}
          />,
        );
      case templateSlug:
        return maybe(
          <TemplateForm
            state={state}
            userId={user.id}
            stateId={stateId}
            disabledSubmit={!step.isStepValid}
          />,
        );
      case contentSlug:
        return maybe(
          <ContentForm
            state={state}
            userId={user.id}
            stateId={stateId}
            disabledSubmit={!step.isStepValid}
          />,
        );
      case previewSlug:
        return maybe(
          <EmailPreview
            state={state}
            userId={user.id}
            stateId={stateId}
            disabledSubmit={!step.isStepValid}
          />,
        );
      case recipientsSlug:
        const searchParams: MessageCreateSearchParams = {
          limit: props.searchParams.limit ?? String(PAGINATION_LIMIT_DEFAULT),
          offset:
            props.searchParams.offset ?? String(PAGINATION_OFFSET_DEFAULT),
          page: props.searchParams.page ?? String(PAGINATION_PAGE_DEFAULT),
          baseUrl:
            props.searchParams.baseUrl ??
            new URL(`${sendAMessage.url}/recipients`, process.env.HOST_URL)
              .href,
          search: props.searchParams.search,
          recipientToAddIds: props.searchParams.recipientToAddIds,
          recipientToRemoveId: props.searchParams.recipientToRemoveId,
        };
        return maybe(
          <Recipients
            state={state}
            userId={user.id}
            stateId={stateId}
            searchParams={searchParams}
          />,
        );
      case scheduleSlug:
        return maybe(
          <ScheduleForm state={state} userId={user.id} stateId={stateId} />,
        );
      case successSlug:
        return maybe(
          <SuccessForm state={state} userId={user.id} stateId={stateId} />,
        );
      default:
        throw notFound();
    }
  },
);
