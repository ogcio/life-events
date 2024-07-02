import { api } from "messages";
import { MessageCreateProps } from "../../../../utils/messaging";
import dayjs from "dayjs";
import { revalidatePath } from "next/cache";
import BackButton from "./BackButton";
import { PgSessions } from "auth/sessions";
import { getTranslations } from "next-intl/server";
import TableControls from "../components/TableControls/TableControls";
import { getQueryParams } from "../components/paginationUtils";
import { sendAMessage } from "../../../../utils/routes";
import { Messaging } from "building-blocks-sdk";
import { notFound } from "next/navigation";
import { pgpool } from "messages/dbConnection";

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
  const urlParams = new URLSearchParams(props.searchParams);
  const queryParams = getQueryParams(urlParams);
  const { userId } = await PgSessions.get();
  const messaging = new Messaging(userId);
  const { data: organisationId } = await messaging.getMockOrganisationId();
  const response = await messaging.getRecipients({
    ...queryParams,
    organisationId,
  });
  if (response.error || !response.data) {
    throw notFound();
  }
  const users = response.data;
  const addedUsers = await getRecipientContacts(props.state.userIds);
  const buildContactLabel = (user: {
    emailAddress?: string | null;
    phoneNumber?: string | null;
    firstName: string | null;
    lastName: string | null;
  }): string => {
    const toUseContact = user.emailAddress ?? user.phoneNumber;
    return `${toUseContact} - ${user.firstName} ${user.lastName}`;
  };

  return (
    <>
      <TableControls
        itemsCount={response.metadata?.totalCount ?? users.length}
        baseUrl={(() => {
          return (
            props.searchParams?.baseUrl ??
            new URL(`${sendAMessage.url}/recipients`, process.env.HOST_URL).href
          );
        })()}
        {...queryParams}
      />
      <div className="govie-grid-column-two-thirds-from-desktop">
        <form action={recipientAction}>
          <h1>
            <span style={{ margin: "unset" }} className="govie-heading-xl">
              {t("title")}
            </span>
          </h1>

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
                <td className="govie-table__cell">
                  {buildContactLabel(recip)}
                </td>
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
    </>
  );
};
