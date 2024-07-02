import { api } from "messages";
import { MessageCreateProps } from "../../../../utils/messaging";
import dayjs from "dayjs";
import ds from "design-system";
import { revalidatePath } from "next/cache";
import BackButton from "./BackButton";
import { PgSessions } from "auth/sessions";
import { getTranslations } from "next-intl/server";
import { getQueryParams } from "../components/paginationUtils";
import { sendAMessage } from "../../../../utils/routes";
import { Messaging } from "building-blocks-sdk";
import { RedirectType, notFound, redirect } from "next/navigation";
import { pgpool } from "messages/dbConnection";
import styles from "../components/TableControls/TableControls.module.scss";

interface RecipientContact {
  id: string;
  emailAddress?: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
}

// Why are not using SDKs?
// To avoid to transport thousand of users through REST APIs every time
const getRecipientContacts = async (
  userIds: string[],
): Promise<RecipientContact[]> => {
  if (userIds.length === 0) {
    return [];
  }
  let startIndex = 1;
  const userIdsIndexes = userIds.map((u) => `$${startIndex++}`).join(",");
  const response = await pgpool.query<RecipientContact>(
    `
    SELECT 
        u.id as "id",
        u.phone as "phoneNumber",
        u.email as "emailAddress",
        u.details->>'firstName' as "firstName",
        u.details->>'lastName' as "lastName"
    FROM users u
    WHERE u.id in (${userIdsIndexes})
  `,
    [...userIds],
  );

  return response.rows;
};

const buildContactLabel = (user: {
  emailAddress?: string | null;
  phoneNumber?: string | null;
  firstName: string | null;
  lastName: string | null;
}): string => {
  const toUseContact = user.emailAddress ?? user.phoneNumber;
  return `${toUseContact} - ${user.firstName} ${user.lastName}`;
};

export default async (props: MessageCreateProps) => {
  const [t, tCommons] = await Promise.all([
    getTranslations("sendAMessage.EmailRecipients"),
    getTranslations("Commons"),
  ]);

  async function submit(formData: FormData) {
    "use server";

    await api.upsertMessageState(
      Object.assign({}, props.state, {
        confirmedRecipientsAt: dayjs().toISOString(),
      }),
      props.userId,
      props.stateId,
    );
    revalidatePath("/");
  }

  async function goBack() {
    "use server";

    const next = Object.assign({}, props.state, { submittedContentAt: "" });
    await api.upsertMessageState(next, props.userId, props.stateId);
    revalidatePath("/");
  }

  async function recipientAction(formData: FormData) {
    "use server";

    const recipient = formData.get("recipient")?.toString();
    if (!recipient) return;

    for (const userId of props.state.userIds) {
      if (userId === recipient) {
        return;
      }
    }

    const next = Object.assign({}, props.state, {
      userIds: [...props.state.userIds, recipient],
    });
    await api.upsertMessageState(next, props.userId, props.stateId);
    revalidatePath("/");
  }

  async function recipientsListAction(formData: FormData) {
    "use server";

    const userId = formData.get("userId");
    if (!userId) {
      return;
    }

    let nextUserIds: string[] = [];
    for (const id of props.state.userIds) {
      if (id !== userId) {
        nextUserIds.push(id);
      }
    }

    const next = Object.assign({}, props.state, {
      userIds: nextUserIds,
    });

    await api.upsertMessageState(next, props.userId, props.stateId);
    revalidatePath("/");
  }

  async function submitSearch(formData: FormData) {
    "use server";
    const url = new URL(`${sendAMessage.url}/recipients`, process.env.HOST_URL);
    const searchParams = url.searchParams;

    const searchQuery = (formData.get("textSearch") as string).trim();
    if (searchQuery.length > 0) {
      searchParams.set("search", searchQuery);
    }
    searchParams.set("limit", "100");

    redirect(url.toString(), RedirectType.replace);
  }

  const urlParams = new URLSearchParams(props.searchParams);
  const queryParams = getQueryParams(urlParams);
  const { userId } = await PgSessions.get();
  const messaging = new Messaging(userId);
  const { data: organisationId } = await messaging.getMockOrganisationId();
  const response = await messaging.getRecipients({
    ...queryParams,
    organisationId,
    transports: props.state.transportations.join(","),
  });

  if (response.error || !response.data) {
    throw notFound();
  }
  const users = response.data;

  const addedUsers = await getRecipientContacts(props.state.userIds);
  return (
    <div className="govie-grid-column-two-thirds-from-desktop">
      <h1>
        <span style={{ margin: "unset" }} className="govie-heading-xl">
          {t("title")}
        </span>
      </h1>
      <form action={submitSearch}>
        <div className="govie-form-group">
          <div className="govie-input__wrapper">
            <input
              type="text"
              id="textSearch"
              name="textSearch"
              className="govie-input"
              autoComplete="off"
              defaultValue={props.searchParams?.search ?? ""}
              autoFocus
              placeholder={t("searchUsersButton")}
            />
            <button
              aria-hidden="true"
              className="govie-input__suffix"
              style={{
                background: ds.colours.ogcio.gold,
                borderColor: ds.colours.ogcio.gold,
              }}
            >
              <ds.Icon icon="search" color={ds.colours.ogcio.white} />
            </button>
          </div>
        </div>
      </form>
      <form action={recipientAction}>
        <div className="govie-form-group">
          <div style={{ margin: "0 0 5px 0" }} className="govie-label--s">
            {t("addRecipientHint")}
          </div>
          <div className="govie-input__wrapper">
            <select className="govie-select" name="recipient">
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {buildContactLabel(user)}
                </option>
              ))}
            </select>
            <button className="govie-input__suffix">{t("add")}</button>
          </div>
        </div>
      </form>

      <table className="govie-table">
        <thead className="govie-table__head">
          <tr className="govie-table__row">
            <th
              scope="col"
              className="govie-table__header govie-!-font-size-27"
            >
              {t("tableRecipientsHeader")}
            </th>
            <th scope="col" className="govie-table__header"></th>
          </tr>
        </thead>
        <tbody className="govie-table__body">
          {addedUsers.map((recip) => (
            <tr key={recip.id} className="govie-table__row">
              <td className="govie-table__cell">{buildContactLabel(recip)}</td>
              <td className="govie-table__cell">
                <form action={recipientsListAction}>
                  <input type="hidden" name="userId" value={recip.id} />
                  <button
                    type="submit"
                    className="govie-button govie-button--small govie-button--outlined"
                    style={{ margin: "unset" }}
                  >
                    {t("tableRemoveButtonText")}
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <form action={submit}>
        <button
          disabled={!Boolean(props.state.userIds.length)}
          className="govie-button"
        >
          {t("submitText")}
        </button>
      </form>
      <form action={goBack}>
        <BackButton>{tCommons("backLink")}</BackButton>
      </form>
    </div>
  );
};
