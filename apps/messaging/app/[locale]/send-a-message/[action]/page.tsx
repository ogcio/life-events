import { RedirectType, notFound, redirect } from "next/navigation";
import { api } from "messages";
import { getCurrentStep } from "../../../utils/messaging";

import { PgSessions } from "auth/sessions";
import { revalidatePath } from "next/cache";
import dayjs from "dayjs";

type ApiMessageState = Parameters<typeof api.upsertMessageState>[0];

type Props = {
  state: ApiMessageState;
  userId: string;
  stateId?: string;
  disabledSubmit?: boolean;
};

const ComposeMessage = (props: Props) => {
  async function submit(formData: FormData) {
    "use server";

    const transportation: string[] = [];
    if (Boolean(formData.get("email"))) {
      transportation.push("email");
    }

    await api.upsertMessageState(
      Object.assign({}, props.state, {
        submittedMetaAt: dayjs().toISOString(),
        transportation,
      }),
      props.userId,
      props.stateId,
    );

    revalidatePath("/");
  }

  return (
    <form action={submit}>
      <h1>Create new message</h1>
      {/* Select transportation checkboxes */}
      <div className="govie-form-group">
        <fieldset className="govie-fieldset" aria-describedby="">
          <h2 className="govie-heading-m">Transportation (copy)</h2>
          <div className="govie-hint">
            A message will be send via the messaging building block regardless
            (copy)
          </div>

          <div
            className="govie-checkboxes govie-checkboxes--small"
            data-module="govie-checkboxes"
          >
            <div className="govie-checkboxes__item">
              <input
                className="govie-checkboxes__input"
                id="email"
                name="email"
                type="checkbox"
                value="email"
                defaultChecked={props.state.transportation.some(
                  (t) => t === "email",
                )}
              />
              <label
                className="govie-label--s govie-checkboxes__label"
                htmlFor="email"
              >
                Email
              </label>
            </div>
            <div className="govie-checkboxes__item">
              <input
                className="govie-checkboxes__input"
                id="sms"
                name="sms"
                type="checkbox"
                value="sms"
                disabled
              />
              <label
                className="govie-label--s govie-checkboxes__label"
                htmlFor="organisation-2"
              >
                SMS
              </label>
            </div>
            <div className="govie-checkboxes__item">
              <input
                className="govie-checkboxes__input"
                id="postal"
                name="postal"
                type="checkbox"
                value="postal"
                disabled
              />
              <label
                className="govie-label--s govie-checkboxes__label"
                htmlFor="postal"
              >
                Postal service
              </label>
            </div>
          </div>
        </fieldset>
      </div>

      <button className="govie-button" type="submit">
        Continue
      </button>
    </form>
  );
};

const Schedule = (props: Props) => {
  async function submit() {
    "use server";
    await api.upsertMessageState(
      Object.assign({}, props.state, {
        confirmedScheduleAt: dayjs().toISOString(),
      }),
      props.userId,
      props.stateId,
    );

    const data: Parameters<typeof api.pushMessage>[0]["data"] = {
      content: props.state.content,
      recipients: props.state.emailRecipients,
      subject: props.state.subject,
      actionUrl: props.state.links?.[0]?.url || "",
    };

    await api.pushMessage({
      data,
      sender: { email: "whatever" },
      transports: props.state.transportation as "email"[], // real pro typescripting
    });

    revalidatePath("/");
  }

  return (
    <form action={submit}>
      <h1 className="govie-heading-l">Schedule</h1>
      <p>Only immediately is actually available..</p>
      <button type="submit" className="govie-button">
        Send
      </button>
    </form>
  );
};

const EmailRecipients = (props: Props) => {
  async function submit(formData: FormData) {
    "use server";
    if (props.disabledSubmit) {
      return;
    }

    const recipient = formData.get("recipient")?.toString();
    if (!recipient) return;

    await api.upsertMessageState(
      Object.assign({}, props.state, {
        emailRecipients: [recipient],
        confirmedEmailRecipientsAt: dayjs().toISOString(),
      }),
      props.userId,
      props.stateId,
    );
    revalidatePath("/");
  }
  return (
    <form action={submit}>
      <h1 className="govie-heading-l">Email Recipients</h1>
      <p>Type a bunch of emails</p>
      <p>Upload CSV file</p>
      <p>Import a named group from some API</p>
      <div className="govie-form-group">
        <label htmlFor="input-field" className="govie-label--s">
          Add recipient
        </label>
        {/* <div className="govie-hint">Added recipients will be added below</div> */}
        <div className="govie-input__wrapper">
          <input
            type="text"
            id="recipient"
            name="recipient"
            className="govie-input"
            defaultValue=""
          />
          {/* <button aria-hidden="true" className="govie-input__suffix">
            Add
          </button> */}
        </div>
      </div>
      <button className="govie-button">Schedule</button>
    </form>
  );
};

const Email = (props: Props) => {
  async function submit(formData: FormData) {
    "use server";

    const subject = formData.get("subject")?.toString();
    const content = formData.get("message")?.toString();
    const link = formData.get("link")?.toString();

    if (!subject || !content || !link) {
      return;
    }

    const next: ApiMessageState = Object.assign({}, props.state, {
      links: [{ url: link, label: "" }],
      content,
      subject,
      submittedEmailAt: dayjs().toISOString(),
    });

    await api.upsertMessageState(next, props.userId, props.stateId);
    revalidatePath("/");
  }

  return (
    <form action={submit}>
      <h1 className="govie-heading-l">Email</h1>
      <p>Lets have some templates here</p>
      <div className="govie-form-group">
        <label htmlFor="input-field" className="govie-label--s">
          Subject
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          className="govie-input"
          autoComplete="off"
        />
      </div>

      <div className="govie-form-group">
        <h1 className="govie-label-wrapper">
          <label htmlFor="message" className="govie-label--s govie-label--l">
            Message
          </label>
        </h1>
        <textarea
          id="message"
          name="message"
          className="govie-textarea"
          rows={5}
        ></textarea>
      </div>

      <div className="govie-form-group">
        <label htmlFor="link" className="govie-label--s">
          Link
        </label>
        <input type="text" id="link" name="link" className="govie-input" />
      </div>

      <button className="govie-back-link">Back</button>
      <button type="submit" className="govie-button">
        Preview
      </button>
    </form>
  );
};

const EmailPreview = (props: Props) => {
  async function submit() {
    "use server";
    await api.upsertMessageState(
      Object.assign({}, props.state, {
        confirmedEmailAt: dayjs().toISOString(),
      }),
      props.userId,
      props.stateId,
    );
    revalidatePath("/");
  }
  return (
    <form action={submit}>
      <h1>Everything looks great</h1>
      <button className="govie-button">Confirm and continue</button>
    </form>
  );
};

const Success = (props: Props) => {
  async function action() {
    "use server";
    props.stateId &&
      (await api.deleteMessageState(props.userId, props.stateId));

    redirect("/send-a-message", RedirectType.replace);
  }
  return (
    <>
      <h1>All done</h1>
      <form action={action}>
        <button className="govie-button" type="submit">
          New message
        </button>
      </form>
    </>
  );
};

// type MessageState = Parameters<typeof api.upsertMessageState>[1];

/**
 * 1 sort out all meta. Which transports do we want, what type (event, message, newsletter), saved info?
 * 2 sort out which transportation (none is ok)
 * 3
 */
const next = { key: null, isStepValid: true };
const rules: Parameters<typeof getCurrentStep<ApiMessageState>>[0] = [
  // First meta selection step
  (state) =>
    Boolean(state.submittedMetaAt) ? next : { key: "meta", isStepValid: true },

  // All transportation steps
  (state) => {
    if (!state.transportation.length) {
      return next;
    }
    for (const asd of state.transportation) {
      if (asd === "email") {
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

const handler = (url: string, key: string) => (Cmp: JSX.Element) => {
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
  const maybe = handler(urlAction, step.key || "");
  switch (step.key) {
    case "meta":
      return maybe(
        <ComposeMessage
          state={state}
          userId={userId}
          stateId={stateId}
          disabledSubmit={!step.isStepValid}
        />,
      );
    case "email":
      return maybe(
        <Email
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
        <Schedule state={state} userId={userId} stateId={stateId} />,
      );
    case "success":
      return maybe(<Success state={state} userId={userId} stateId={stateId} />);
    default:
      throw notFound();
  }
  //   return <>{JSON.stringify(props.params.action, null, 4)}</>;
};
