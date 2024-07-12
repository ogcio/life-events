import { api } from "messages";
import { MessageCreateProps } from "../../../../utils/messaging";
import dayjs from "dayjs";
import ds from "design-system";
import { revalidatePath } from "next/cache";
import BackButton from "./BackButton";
import { getTranslations } from "next-intl/server";
import { getQueryParams } from "../components/paginationUtils";
import { sendAMessage } from "../../../../utils/routes";
import { Messaging } from "building-blocks-sdk";
import { RedirectType, notFound, redirect } from "next/navigation";
import { pgpool } from "messages/dbConnection";
import styles from "../components/Table.module.scss";
import { AuthenticationFactory } from "../../../../utils/authentication-factory";

interface RecipientContact {
  id: string;
  emailAddress?: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
}

const TO_ADD_IDS_KEY = "recipientToAddIds";
const TO_REMOVE_ID_KEY = "recipientToRemoveId";

const getBaseUrl = (): URL =>
  new URL(`${sendAMessage.url}/recipients`, process.env.HOST_URL);

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
  const fillSearchParams = async (
    searchParams: URLSearchParams,
    search?: string,
    toAddRecipientIds?: string[],
    toRemoveRecipientId?: string,
  ) => {
    "use server";
    if (search?.length) {
      searchParams.set("search", search);
    }
    searchParams.set("limit", "20");
    if (toAddRecipientIds?.length) {
      searchParams.set(TO_ADD_IDS_KEY, toAddRecipientIds.join(","));
    }
    if (toRemoveRecipientId?.length) {
      searchParams.set(TO_REMOVE_ID_KEY, toRemoveRecipientId);
    }
    return searchParams;
  };

  const [t, tCommons] = await Promise.all([
    getTranslations("sendAMessage.EmailRecipients"),
    getTranslations("Commons"),
  ]);

  async function removeRecipientAction(formData: FormData) {
    "use server";

    const userId = formData.get("recipient");
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

  async function addRecipientAction(formData: FormData) {
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

  async function submitSearch(formData: FormData) {
    "use server";
    const searchQuery = (formData.get("textSearch") as string).trim();
    const url = getBaseUrl();
    let searchParams = url.searchParams;
    await fillSearchParams(searchParams, searchQuery);

    redirect(url.toString(), RedirectType.replace);
  }

  const urlParams = new URLSearchParams(props.searchParams);
  const queryParams = getQueryParams(urlParams);
  const { accessToken, organization } =
    await AuthenticationFactory.getInstance().getPublicServant();
  if (!accessToken || !organization) {
    throw notFound();
  }
  const messaging = new Messaging(accessToken);
  const response = await messaging.getRecipients({
    ...queryParams,
    organisationId: organization.id,
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
      {/* Search bar */}
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

      {/* Search results table  */}
      <div className="govie-form-group">
        <div style={{ margin: "0 0 5px 0" }} className="govie-label--s">
          {t("searchResultsCaption")}
        </div>
        <table className="govie-table">
          <thead className="govie-table__head">
            <tr className="govie-table__row">
              <th scope="col" className="govie-table__header">
                {t("searchTable.fullNameHeader")}
              </th>
              <th scope="col" className="govie-table__header">
                {t("searchTable.emailHeader")}
              </th>
              <th scope="col" className="govie-table__header">
                {t("searchTable.phoneHeader")}
              </th>
              <th scope="col" className="govie-table__header">
                {t("searchTable.actionsHeader")}
              </th>
            </tr>
          </thead>
          <tbody className="govie-table__body">
            {users?.map((foundUser) => (
              <tr className="govie-table__row" key={foundUser.id}>
                <th className="govie-table__header govie-table__header--vertical-centralized govie-body-s">
                  {foundUser.firstName} {foundUser.lastName}
                </th>
                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  {foundUser.emailAddress}
                </td>
                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  {foundUser.phoneNumber}
                </td>
                <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                  <form action={addRecipientAction}>
                    <input
                      type="hidden"
                      name="recipient"
                      value={foundUser.id}
                    />

                    <div style={{ display: "flex", alignItems: "center" }}>
                      <button className={`${styles.tableActionButton}`}>
                        {t("searchTable.addButton")}
                      </button>
                    </div>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Added recipients table */}
      <div className="govie-form-group">
        <div className="govie-form-group">
          <div style={{ margin: "0 0 5px 0" }} className="govie-label--s">
            {t("selectedRecipientsCaption")}
          </div>
          <table className="govie-table">
            <thead className="govie-table__head">
              <tr className="govie-table__row">
                <th scope="col" className="govie-table__header">
                  {t("searchTable.fullNameHeader")}
                </th>
                <th scope="col" className="govie-table__header">
                  {t("searchTable.emailHeader")}
                </th>
                <th scope="col" className="govie-table__header">
                  {t("searchTable.phoneHeader")}
                </th>
                <th scope="col" className="govie-table__header">
                  {t("searchTable.actionsHeader")}
                </th>
              </tr>
            </thead>
            <tbody className="govie-table__body">
              {addedUsers?.map((foundUser) => (
                <tr className="govie-table__row" key={foundUser.id}>
                  <th className="govie-table__header govie-table__header--vertical-centralized govie-body-s">
                    {foundUser.firstName} {foundUser.lastName}
                  </th>
                  <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                    {foundUser.emailAddress}
                  </td>
                  <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                    {foundUser.phoneNumber}
                  </td>
                  <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                    <form action={removeRecipientAction}>
                      <input
                        type="hidden"
                        name="recipient"
                        value={foundUser.id}
                      />
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <button className={`${styles.tableActionButton}`}>
                          {t("searchTable.removeButton")}
                        </button>
                      </div>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
