import { PgSessions } from "auth/sessions";
import { Messaging } from "building-blocks-sdk";
import { temporaryMockUtils } from "messages";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";

const defaultErrorStateId = "email_provider_form";

const ProviderInput = (props: {
  id: string;
  label: string;
  hint?: string;
  defaultValue?: string | number;
  error?: string;
}) => (
  <div
    className={
      !Boolean(props.error)
        ? "govie-form-group"
        : "govie-form-group govie-form-group--error"
    }
  >
    {props.error && (
      <p id="input-field-error" className="govie-error-message">
        <span className="govie-visually-hidden">Error:</span>
        {props.error}
      </p>
    )}
    <label htmlFor="host" className="govie-label--s">
      {props.label}
    </label>
    {props.hint && (
      <div className="govie-hint" id="input-field-hint">
        {props.hint}
      </div>
    )}
    <input
      id={props.id}
      type="text"
      name={props.id}
      className="govie-input"
      defaultValue={props.defaultValue}
    />
  </div>
);

export default async (props: { searchParams: { id: string } }) => {
  const [t, errorT] = await Promise.all([
    getTranslations("settings.EmailProvider"),
    getTranslations("formErrors"),
  ]);

  async function submitAction(formData: FormData) {
    "use server";

    const name = formData.get("name")?.toString();
    const host = formData.get("host")?.toString();
    const port = Number(formData.get("port")?.toString());
    const username = formData.get("username")?.toString();
    const password = formData.get("password")?.toString();
    const fromAddress = formData.get("fromAddress")?.toString();
    const throttle = Number(formData.get("throttle")?.toString()) || undefined;

    const id = formData.get("id")?.toString();

    const formErrors: Parameters<typeof temporaryMockUtils.createErrors>[0] =
      [];

    const required = { name, host, port, username, password, fromAddress };
    for (const field of Object.keys(required)) {
      if (!required[field]) {
        formErrors.push({
          errorValue: "",
          field,
          messageKey: "empty",
        });
      }
    }

    const { userId } = await PgSessions.get();
    if (formErrors.length) {
      await temporaryMockUtils.createErrors(
        formErrors,
        userId,
        id || defaultErrorStateId,
      );
      return revalidatePath("/");
    }

    // Just for ts type assertions, at this point this is always false.
    if (!name || !host || !username || !password || !port || !fromAddress) {
      return;
    }

    const messagesClient = new Messaging(userId);

    if (!id) {
      await messagesClient.createEmailProvider({
        name,
        host,
        username,
        password,
        port,
        fromAddress,
        throttle,
      });
    } else {
      await messagesClient.updateEmailProvider(id, {
        host,
        port,
        id,
        name,
        password,
        username,
        fromAddress,
        throttle,
      });
    }
    redirect(new URL("admin/settings/emails", process.env.HOST_URL).href);
  }

  const { userId } = await PgSessions.get();
  const { data } = await new Messaging(userId).getEmailProvider(
    props.searchParams.id,
  );

  const errors = await temporaryMockUtils.getErrors(
    userId,
    props.searchParams.id || defaultErrorStateId,
  );

  const nameError = errors.find((error) => error.field === "name");
  const hostError = errors.find((error) => error.field === "host");
  const portError = errors.find((error) => error.field === "port");
  const usernameError = errors.find((error) => error.field === "username");
  const passwordError = errors.find((error) => error.field === "password");
  const throttleError = errors.find((error) => error.field === "throttle");
  const fromAddressError = errors.find(
    (error) => error.field === "fromAddress",
  );

  return (
    <>
      <h1>
        <span className="govie-heading-l">
          {data?.id ? t("titleUpdate") : t("titleAdd")}
        </span>
      </h1>
      <form action={submitAction}>
        <input name="id" value={props.searchParams.id} type="hidden" />
        <ProviderInput
          id="name"
          label={t("nameLabel")}
          defaultValue={data?.name}
          error={
            nameError &&
            errorT(nameError.messageKey, {
              field: errorT(`fields.${nameError.field}`),
              indArticleCheck: "",
            })
          }
        />

        <ProviderInput
          id="host"
          label={t("hostLabel")}
          defaultValue={data?.host}
          error={
            hostError &&
            errorT(hostError.messageKey, {
              field: errorT(`fields.${hostError.field}`),
              indArticleCheck: "",
            })
          }
        />

        <ProviderInput
          id="port"
          label={t("portLabel")}
          defaultValue={data?.port}
          error={
            portError &&
            errorT(portError.messageKey, {
              field: errorT(`fields.${portError.field}`),
              indArticleCheck: "",
            })
          }
        />

        <ProviderInput
          id="username"
          label={t("usernameLabel")}
          defaultValue={data?.username}
          error={
            usernameError &&
            errorT(usernameError.messageKey, {
              field: errorT(`fields.${usernameError.field}`),
              indArticleCheck: "",
            })
          }
        />

        <ProviderInput
          id="password"
          label={t("passwordLabel")}
          defaultValue={data?.password}
          error={
            passwordError &&
            errorT(passwordError.messageKey, {
              field: errorT(`fields.${passwordError.field}`),
              indArticleCheck: "",
            })
          }
        />

        <ProviderInput
          id="fromAddress"
          label={t("fromAddressLabel")}
          defaultValue={data?.fromAddress}
          error={
            fromAddressError &&
            errorT(fromAddressError.messageKey, {
              field: errorT(`fields.${fromAddressError.field}`),
              indArticleCheck: "",
            })
          }
        />

        <ProviderInput
          id="throttle"
          label={t("throttleLabel")}
          hint={t("throttleHint")}
          defaultValue={data?.throttle}
          error={
            throttleError &&
            errorT(throttleError.messageKey, {
              field: errorT(`fields.${throttleError.field}`),
              indArticleCheck: "",
            })
          }
        />

        <button className="govie-button" type="submit">
          {props.searchParams.id ? t("updateButton") : t("createButton")}
        </button>
      </form>
      <Link className="govie-back-link" href={"./"}>
        {t("backLink")}
      </Link>
    </>
  );
};
