import { Messaging } from "building-blocks-sdk";
import { PgSessions } from "auth/sessions";
import { temporaryMockUtils } from "messages";
import { notFound, redirect } from "next/navigation";
import { usersSettingsRoutes } from "../../../../utils/routes";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  searchKeySettingType,
  searchValueOrganisation,
} from "../../../../utils/messaging";
import { FormElement } from "../../../admin/FormElement";

enum AVAILABLE_TRANSPORTS {
  SMS = "sms",
  EMAIL = "email",
}

enum AVAILABLE_STATUSES {
  PENDING = "pending",
  ACCEPTED = "accepted",
  DECLINED = "declined",
}

export default async (props: { params: { organisationId: string } }) => {
  const t = await getTranslations("userSettings.Organisation");

  const { userId } = await PgSessions.get();
  const messagingClient = await new Messaging(userId);
  const configurations = await messagingClient.getOrganisationInvitation(
    props.params.organisationId,
  );
  if (configurations.error) {
    return notFound();
  }

  async function submitAction(formData: FormData) {
    "use server";

    const submitTrans = await getTranslations("userSettings.Organisation");
    const url = new URL(usersSettingsRoutes.url, process.env.HOST_URL);
    url.searchParams.append(searchKeySettingType, searchValueOrganisation);
    const orgId = formData.get("organisationId")?.toString();
    if (!orgId) {
      throw new Error("Organisation id is missing!");
    }

    const status =
      formData.get("invitationStatus") ?? AVAILABLE_STATUSES.ACCEPTED;
    let preferredTransports: string[] = [];
    for (const transport of Object.values(AVAILABLE_TRANSPORTS)) {
      if (Boolean(formData.get(transport))) {
        preferredTransports.push(transport);
      }
    }

    if (status === AVAILABLE_STATUSES.PENDING) {
      redirect(url.href);
    }

    const formErrors: Parameters<typeof temporaryMockUtils.createErrors>[0] =
      [];

    if (
      preferredTransports.length === 0 &&
      status === AVAILABLE_STATUSES.ACCEPTED
    ) {
      formErrors.push({
        errorValue: submitTrans("minimumOneTransport"),
        field: "invitationStatus",
        messageKey: "not_valid",
      });
    }

    if (formErrors.length) {
      await temporaryMockUtils.createErrors(formErrors, userId, orgId);
      return revalidatePath("/");
    }

    if (status === AVAILABLE_STATUSES.DECLINED) {
      preferredTransports = [];
    }

    const submitClient = await new Messaging(userId);

    await submitClient.updateInvitation({ userStatusFeedback: "active" });
    await submitClient.updateOrganisationInvitation(orgId, {
      invitationStatusFeedback: status as "accepted" | "declined",
      preferredTransports,
    });

    redirect(url.href);
  }

  const errors = await temporaryMockUtils.getErrors(
    userId,
    props.params.organisationId,
  );

  const statusError = errors.find(
    (error) => error.field === "invitationStatus",
  );

  return (
    <>
      <h1>
        <span className="govie-heading-l">{t("title")}</span>
      </h1>
      <form action={submitAction}>
        <input
          name="organisationId"
          value={props.params.organisationId}
          type="hidden"
        />

        <div className="govie-form-group">
          <FormElement
            id="invitationStatus"
            label={t("selectInvitationStatus")}
            error={statusError && t("minimumOneTransport")}
          >
            <br></br>
            <select
              className="govie-select"
              name="invitationStatus"
              id="invitationStatus"
              defaultValue={configurations.data?.organisationInvitationStatus}
            >
              {Object.values(AVAILABLE_STATUSES).map((status) => (
                <option key={status} value={status}>
                  {t(`statuses.${status}`)}
                </option>
              ))}
            </select>
          </FormElement>
        </div>
        <div className="govie-form-group">
          <h3 className="govie-heading-s">{t("chooseTransportation")}</h3>

          <fieldset className="govie-fieldset">
            <div
              className="govie-checkboxes govie-checkboxes--small"
              data-module="govie-checkboxes"
            >
              <div className="govie-checkboxes__item">
                <input
                  className="govie-checkboxes__input"
                  id={AVAILABLE_TRANSPORTS.EMAIL}
                  name={AVAILABLE_TRANSPORTS.EMAIL}
                  type="checkbox"
                  value={AVAILABLE_TRANSPORTS.EMAIL}
                  defaultChecked={configurations.data?.organisationPreferredTransports?.includes(
                    AVAILABLE_TRANSPORTS.EMAIL,
                  )}
                />
                <label
                  className="govie-label--s govie-checkboxes__label"
                  htmlFor={AVAILABLE_TRANSPORTS.EMAIL}
                >
                  {t(AVAILABLE_TRANSPORTS.EMAIL)}
                </label>
              </div>
              <div className="govie-checkboxes__item">
                <input
                  className="govie-checkboxes__input"
                  id={AVAILABLE_TRANSPORTS.SMS}
                  name={AVAILABLE_TRANSPORTS.SMS}
                  type="checkbox"
                  value={AVAILABLE_TRANSPORTS.SMS}
                  defaultChecked={configurations.data?.organisationPreferredTransports?.includes(
                    AVAILABLE_TRANSPORTS.SMS,
                  )}
                />
                <label
                  className="govie-label--s govie-checkboxes__label"
                  htmlFor={AVAILABLE_TRANSPORTS.SMS}
                >
                  {t(AVAILABLE_TRANSPORTS.SMS)}
                </label>
              </div>
            </div>
          </fieldset>
        </div>

        <button className="govie-button" type="submit">
          {t("updateButton")}
        </button>
      </form>

      <Link className="govie-back-link" href={`/${usersSettingsRoutes.url}`}>
        {t("backLink")}
      </Link>
    </>
  );
};
