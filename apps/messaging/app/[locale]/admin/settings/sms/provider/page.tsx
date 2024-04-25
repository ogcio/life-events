import { PgSessions } from "auth/sessions";
import { Messaging } from "building-blocks-sdk";
import { getTranslations } from "next-intl/server";
import { pgpool } from "messages/dbConnection";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FormElement } from "../../emails/provider/page";

type AwsProviderConfig = {
  accessKey: string;
  secretAccessKey: string;
  region: string;
};

type AwsState = {
  name: string;
  type: "AWS";
  accessKey: string;
  secretAccessKey: string;
  region: string;
};

function isAws(config: unknown): config is AwsProviderConfig {
  return Boolean(
    (config as AwsProviderConfig)?.accessKey &&
      (config as AwsProviderConfig)?.accessKey,
  );
}

function isAwsState(state: unknown): state is AwsState {
  return (state as AwsState)?.type === "AWS";
}

async function getState(userId: string) {
  "use server";
  return pgpool
    .query<{ state: any }>(
      `
        select state from sms_provider_states
        where user_id = $1
    `,
      [userId],
    )
    .then((res) => res.rows.at(0)?.state);
}

export default async (props: { searchParams?: { id: string } }) => {
  const [t, terror] = await Promise.all([
    getTranslations("settings.SmsProvider"),
    getTranslations("formErrors"),
  ]);

  async function submitAction(formData: FormData) {
    "use server";
    const { userId } = await PgSessions.get();
    const state = await getState(userId);

    const name = formData.get("name")?.toString();

    // zzz..
    if (isAwsState(state)) {
      const secretAccessKey = formData.get("secretAccessKey")?.toString();
      const accessKey = formData.get("accessKey")?.toString();
      const region = formData.get("region")?.toString();

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
        });
        error = createError;
      }
      if (!error) {
        redirect("/admin/settings/sms");
      }
    }
  }

  async function submitProviderType(formData: FormData) {
    "use server";
    const providerType = formData.get("providerType")?.toString();

    if (providerType) {
      const { userId } = await PgSessions.get();
      await pgpool.query(
        `
            insert into sms_provider_states(user_id, state)
            values($1, $2)
            on conflict(user_id) do update
            set state = $2
        `,
        [userId, { type: providerType }],
      );
    }

    revalidatePath("/");
  }

  const { userId } = await PgSessions.get();
  const sdkClient = new Messaging(userId);
  const data: Awaited<ReturnType<typeof sdkClient.getSmsProvider>>["data"] =
    props.searchParams?.id
      ? (await sdkClient.getSmsProvider(props.searchParams?.id)).data
      : undefined;

  const state = await getState(userId);

  console.log(state);
  return (
    <>
      <h1>
        <span className="govie-heading-l">
          {data?.id ? t("titleUpdate") : t("titleAdd")}
        </span>
      </h1>
      <form action={submitProviderType}>
        <select name="providerType">
          <option>AWS</option>
        </select>
        <button>Select</button>
      </form>
      <form action={submitAction}>
        <input name="id" value={props.searchParams?.id} type="hidden" />
        {isAwsState(state) ? (
          <>
            <h3>AWS</h3>
            <FormElement id="name" label={t("nameLabel")}>
              <input
                id="name"
                type="text"
                name="name"
                className="govie-input"
                defaultValue={state.name ?? data?.name}
              />
            </FormElement>
            <FormElement id="accessKey" label={t("accessKeyLabel")}>
              <input
                id="accessKey"
                type="text"
                name="accessKey"
                className="govie-input"
                defaultValue={state.accessKey ?? data?.config.accessKey}
              />
            </FormElement>
            <FormElement id="secretAccessKey" label={t("secretAccessKey")}>
              <input
                id="secretAccessKey"
                type="text"
                name="secretAccessKey"
                className="govie-input"
                defaultValue={
                  state.secretAccessKey ?? data?.config.secretAccessKey
                }
              />
            </FormElement>
            <FormElement id="region" label={t("region")}>
              <input
                id="region"
                type="text"
                name="region"
                className="govie-input"
                defaultValue={state.region ?? data?.config.region}
              />
            </FormElement>
          </>
        ) : null}
        <button className="govie-button">
          {props.searchParams?.id ? t("submitUpdate") : t("submitCreate")}
        </button>
      </form>
    </>
  );
};
