import { Messaging } from "building-blocks-sdk";
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
import { AuthenticationContextFactory } from "auth/authentication-context-factory";

enum AVAILABLE_TRANSPORTS {
  SMS = "sms",
  EMAIL = "email",
}

enum AVAILABLE_STATUSES {
  PENDING = "pending",
  ACCEPTED = "accepted",
  DECLINED = "declined",
}

enum ACTIVE_STATUSES {
  ACCEPTED = "accepted",
  DECLINED = "declined",
}

export default async (props: { params: { organisationId: string } }) => {
  async function submitAction(formData: FormData) {
    "use server";
    const submitUser = await AuthenticationContextFactory.getUser();
    const submitAccessToken =
      await AuthenticationContextFactory.getAccessToken();
    const submitTrans = await getTranslations("userSettings.Organisation");
    const url = new URL(usersSettingsRoutes.url, process.env.HOST_URL);
    url.searchParams.append(searchKeySettingType, searchValueOrganisation);
    const orgId = formData.get("organisationId")?.toString();
    if (!orgId) {
      return notFound();
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
      await temporaryMockUtils.createErrors(formErrors, submitUser.id, orgId);
      return revalidatePath("/");
    }

    if (status === AVAILABLE_STATUSES.DECLINED) {
      preferredTransports = [];
    }

    const submitClient = await new Messaging(submitAccessToken);

    await submitClient.updateInvitation({ userStatusFeedback: "active" });
    await submitClient.updateOrganisationInvitation(orgId, {
      invitationStatusFeedback: status as "accepted" | "declined",
      preferredTransports,
    });

    redirect(url.href);
  }

  const [t, tCommons] = await Promise.all([
    getTranslations("userSettings.Organisation"),
    getTranslations("Commons"),
  ]);

  const { user, accessToken } = await AuthenticationContextFactory.getContext();
  const messagingClient = await new Messaging(accessToken);
  const configurations = await messagingClient.getOrganisationInvitation(
    props.params.organisationId,
  );
  if (configurations.error) {
    return notFound();
  }

  const errors = await temporaryMockUtils.getErrors(
    user.id,
    props.params.organisationId,
  );

  const statusError = errors.find(
    (error) => error.field === "invitationStatus",
  );

  const toUseStatusEnum =
    configurations.data?.organisationInvitationStatus != "pending"
      ? ACTIVE_STATUSES
      : AVAILABLE_STATUSES;

  return (
    <>
      <h1>
        <span className="govie-heading-l">{t("title")}</span>
      </h1>
      <p className="govie-body">
        {/* {organisationId} At the moment we want "Life Events" as fixed value */}
        Life Events
      </p>
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
              {Object.values(toUseStatusEnum).map((status) => (
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
        {tCommons("backLink")}
      </Link>
    </>
  );
};
