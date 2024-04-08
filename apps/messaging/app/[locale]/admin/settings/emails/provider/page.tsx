import { PgSessions } from "auth/sessions";
import { mailApi, temporaryMockUtils } from "messages";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";

const defaultErrorStateId = "email_provider_form";

const ProviderInput = (props: {
  id: string;
  label: string;
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
  // const t = await getTranslations("settings.EmailProvider");
  // const errorT = await getTranslations("formError")
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

    const id = formData.get("id")?.toString();

    const formErrors: Parameters<typeof temporaryMockUtils.createErrors>[0] =
      [];

    const o = { name, host, port, username, password };
    for (const field of Object.keys(o)) {
      if (!o[field]) {
        formErrors.push({
          errorValue: "",
          field,
          messageKey: "empty",
        });
      }
    }

    if (formErrors.length) {
      const { userId } = await PgSessions.get();
      await temporaryMockUtils.createErrors(
        formErrors,
        userId,
        id || defaultErrorStateId,
      );
      return revalidatePath("/");
    }

    // Just for ts type assertions, at this point this is always false.
    if (!name || !host || !username || !password || !port) {
      return;
    }

    if (!id) {
      await mailApi.createProvider({ name, host, username, password, port });
    } else {
      await mailApi.updateProvider({
        host,
        port,
        id,
        name,
        password,
        username,
      });
    }
    redirect(new URL("admin/settings/emails", process.env.HOST_URL).href);
  }

  const data = props.searchParams.id
    ? await mailApi.provider(props.searchParams.id)
    : undefined;

  const { userId } = await PgSessions.get();
  const errors = await temporaryMockUtils.getErrors(
    userId,
    props.searchParams.id || defaultErrorStateId,
  );

  const nameError = errors.find((error) => error.field === "name");
  const hostError = errors.find((error) => error.field === "host");
  const portError = errors.find((error) => error.field === "port");
  const usernameError = errors.find((error) => error.field === "username");
  const passwordError = errors.find((error) => error.field === "password");

  return (
    <>
      <h1>
        <span className="govie-heading-l">{t("title")}</span>
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
