import { PgSessions } from "auth/sessions";
import { Messaging } from "building-blocks-sdk";
import { getTranslations } from "next-intl/server";
import { pgpool } from "messages/dbConnection";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { temporaryMockUtils } from "messages";
import { FormElement } from "../../FormElement";
import FlexMenuWrapper from "../../PageWithMenuFlexWrapper";
import { providerRoutes } from "../../../../utils/routes";
const awsErrorKey = "aws-provider-form";
const providerTypeErrorKey = "provider-type";

// Union any other provider types here..
type State = AwsState;

type AwsState = {
  name: string;
  type: "AWS";
  accessKey: string;
  secretAccessKey: string;
  region: string;
};

function isAwsState(state: unknown): state is AwsState {
  return (state as AwsState)?.type === "AWS";
}

async function getState(
  userId: string,
  deleteOnFetch = false,
): Promise<State | undefined> {
  "use server";

  const query = deleteOnFetch
    ? `
    delete from sms_provider_states
    where user_id = $1
    returning state
  `
    : `
    select state from sms_provider_states
    where user_id = $1
  `;
  return pgpool
    .query<{ state: any }>(query, [userId])
    .then((res) => res.rows.at(0)?.state);
}

export default async (props: {
  params: { locale: string };
  searchParams?: { id: string };
}) => {
  const [t, terror, tCommons] = await Promise.all([
    getTranslations("settings.SmsProvider"),
    getTranslations("formErrors"),
    getTranslations("Commons"),
  ]);

  async function submitAction(formData: FormData) {
    "use server";
    const { userId } = await PgSessions.get();
    const state = await getState(userId);

    const name = formData.get("name")?.toString();
    const providerType = formData.get("providerType")?.toString();

    if (providerType === "aws") {
      const secretAccessKey = formData.get("secretAccessKey")?.toString();
      const accessKey = formData.get("accessKey")?.toString();
      const region = formData.get("region")?.toString();
      const isPrimary = Boolean(formData.get("isPrimary")?.toString());

      const required = { accessKey, secretAccessKey, name, region };
      const formErrors: Parameters<typeof temporaryMockUtils.createErrors>[0] =
        [];

      for (const field of Object.keys(required)) {
        if (!required[field]) {
          formErrors.push({
            errorValue: "",
            field,
            messageKey: "empty",
          });
        }
      }

      if (formErrors.length) {
        await temporaryMockUtils.createErrors(formErrors, userId, awsErrorKey);
        return revalidatePath("/");
      }
      if (!accessKey || !secretAccessKey || !name || !region) {
        return;
      }

      const sdk = new Messaging(userId);
      const providerId = props.searchParams?.id;
      let error: any = undefined;
      if (providerId) {
        const { error: updateError } = await sdk.updateSmsProvider(providerId, {
          id: providerId,
          name,
          config: {
            accessKey,
            secretAccessKey,
            region,
            type: "AWS",
          },
          isPrimary,
        });
        error = updateError;
      } else {
        const { error: createError } = await sdk.createSmsProvider({
          name,
          config: {
            accessKey,
            secretAccessKey,
            region,
            type: "AWS",
          },
          isPrimary,
        });
        error = createError;
      }
      if (!error) {
        redirect(
          new URL(
            `${props.params.locale}/${providerRoutes.url}?provider=sms`,
            process.env.HOST_URL,
          ).href,
        );
      }
    }
  }

  async function submitProviderType(formData: FormData) {
    "use server";
    const { userId } = await PgSessions.get();
    const providerType = formData.get("providerType")?.toString();

    if (!providerType) {
      await temporaryMockUtils.createErrors(
        [
          {
            errorValue: "",
            field: "providerType",
            messageKey: "empty",
          },
        ],
        userId,
        providerTypeErrorKey,
      );
      return revalidatePath("/");
    }

    await pgpool.query(
      `
            insert into sms_provider_states(user_id, state)
            values($1, $2)
            on conflict(user_id) do update
            set state = $2
        `,
      [userId, { type: providerType }],
    );

    revalidatePath("/");
  }

  const { userId } = await PgSessions.get();
  const sdkClient = new Messaging(userId);
  const data: Awaited<ReturnType<typeof sdkClient.getSmsProvider>>["data"] =
    props.searchParams?.id
      ? (await sdkClient.getSmsProvider(props.searchParams?.id)).data
      : undefined;

  const state = await getState(userId);

  const awsErrors = await temporaryMockUtils.getErrors(userId, awsErrorKey);

  const nameError = awsErrors.find((error) => error.field === "name");
  const accessKeyError = awsErrors.find((error) => error.field === "accessKey");
  const secretAccessKeyError = awsErrors.find(
    (error) => error.field === "secretAccessKey",
  );
  const regionError = awsErrors.find((error) => error.field === "region");

  return (
    <FlexMenuWrapper>
      <h1>
        <span className="govie-heading-l">
          {data?.id ? t("titleUpdate") : t("titleAdd")}
        </span>
      </h1>
      <form action={submitProviderType}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "fit-content",
          }}
        >
          <label className="govie-label--s" htmlFor="providerType">
            {t("selectProviderLabel")}
          </label>
          <select
            className="govie-select"
            name="providerType"
            id="providerType"
          >
            <option>AWS</option>
          </select>
          <button className="govie-button">
            {t("submitProviderTypeSelect")}
          </button>
        </div>
      </form>
      <form action={submitAction}>
        <input name="id" value={props.searchParams?.id} type="hidden" />
        {isAwsState(state) || isAwsState(data?.config) ? (
          <>
            <input type="hidden" name="providerType" value="aws" />
            <h3>AWS</h3>
            <FormElement
              id="name"
              label={t("nameLabel")}
              error={
                // assumes messageKey is only (empty)
                nameError &&
                terror(nameError.messageKey, {
                  field: terror(`fields.${nameError.field}`),
                  indArticleCheck: "",
                })
              }
            >
              <input
                id="name"
                type="text"
                name="name"
                className="govie-input"
                defaultValue={state?.name || data?.name}
              />
            </FormElement>
            <FormElement
              id="accessKey"
              label={t("accessKeyLabel")}
              error={
                // assumes messageKey is only (empty)
                accessKeyError &&
                terror(accessKeyError.messageKey, {
                  field: terror(`fields.${accessKeyError.field}`),
                  indArticleCheck: "an",
                })
              }
            >
              <input
                id="accessKey"
                type="text"
                name="accessKey"
                className="govie-input"
                defaultValue={state?.accessKey || data?.config.accessKey}
              />
            </FormElement>
            <FormElement
              id="secretAccessKey"
              label={t("secretAccessKey")}
              error={
                // assumes messageKey is only (empty)
                secretAccessKeyError &&
                terror(secretAccessKeyError.messageKey, {
                  field: terror(`fields.${secretAccessKeyError.field}`),
                  indArticleCheck: "",
                })
              }
            >
              <input
                id="secretAccessKey"
                type="text"
                name="secretAccessKey"
                className="govie-input"
                defaultValue={
                  state?.secretAccessKey || data?.config.secretAccessKey
                }
              />
            </FormElement>
            <FormElement
              id="region"
              label={t("region")}
              error={
                // assumes messageKey is only (empty)
                regionError &&
                terror(regionError.messageKey, {
                  field: terror(`fields.${regionError.field}`),
                  indArticleCheck: "",
                })
              }
            >
              <input
                id="region"
                type="text"
                name="region"
                className="govie-input"
                defaultValue={state?.region || data?.config.region}
              />
            </FormElement>
            <FormElement id="isPrimary">
              <fieldset className="govie-fieldset">
                <div className="govie-checkboxes govie-checkboxes--medium">
                  <div className="govie-checkboxes__item">
                    <input
                      className="govie-checkboxes__input"
                      id="isPrimary"
                      name="isPrimary"
                      type="checkbox"
                      value="isPrimary"
                      defaultChecked={data?.isPrimary}
                    />
                    <label
                      className="govie-label--s govie-checkboxes__label"
                      htmlFor="isPrimary"
                    >
                      {t("isPrimary")}
                    </label>
                  </div>
                </div>
              </fieldset>
            </FormElement>
          </>
        ) : null}

        <button
          className="govie-button"
          disabled={!Boolean(state?.type || data?.id)}
        >
          {props.searchParams?.id ? t("submitUpdate") : t("submitCreate")}
        </button>
      </form>

      <a
        href={
          new URL(
            `${props.params.locale}/${providerRoutes.url}?provider=sms`,
            process.env.HOST_URL,
          ).href
        }
        className="govie-back-link"
      >
        {tCommons("backLink")}
      </a>
    </FlexMenuWrapper>
  );
};
