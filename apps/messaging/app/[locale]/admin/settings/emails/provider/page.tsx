import { PgSessions } from "auth/sessions";
import { Messaging } from "building-blocks-sdk";
import { temporaryMockUtils } from "messages";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";

const defaultErrorStateId = "email_provider_form";

export const FormElement = ({
  children,
  error,
  label,
  id,
  hint,
}: React.PropsWithChildren<{
  error?: string;
  label: string;
  id: string;
  hint?: string;
}>) => {
  return (
    <div
      className={
        !Boolean(error)
          ? "govie-form-group"
          : "govie-form-group govie-form-group--error"
      }
    >
      {error && (
        <p id="input-field-error" className="govie-error-message">
          <span className="govie-visually-hidden">Error:</span>
          {error}
        </p>
      )}
      <label htmlFor={id} className="govie-label--s">
        {label}
      </label>
      {hint && (
        <div className="govie-hint" id="input-field-hint">
          {hint}
        </div>
      )}
      {children}
    </div>
  );
};

// export const ProviderInput = (props: {
//   id: string;
//   label: string;
//   hint?: string;
//   defaultValue?: string | number;
//   error?: string;
// }) => (
//   <div
//     className={
//       !Boolean(props.error)
//         ? "govie-form-group"
//         : "govie-form-group govie-form-group--error"
//     }
//   >
//     {props.error && (
//       <p id="input-field-error" className="govie-error-message">
//         <span className="govie-visually-hidden">Error:</span>
//         {props.error}
//       </p>
//     )}
//     <label htmlFor="host" className="govie-label--s">
//       {props.label}
//     </label>
//     {props.hint && (
//       <div className="govie-hint" id="input-field-hint">
//         {props.hint}
//       </div>
//     )}
//     <input
//       id={props.id}
//       type="text"
//       name={props.id}
//       className="govie-input"
//       defaultValue={props.defaultValue}
//     />
//   </div>
// );

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
        <FormElement
          id="name"
          label={t("nameLabel")}
          error={
            nameError &&
            errorT(nameError.messageKey, {
              field: errorT(`fields.${nameError.field}`),
              indArticleCheck: "",
            })
          }
        >
          <input
            id="name"
            type="text"
            name="name"
            className="govie-input"
            defaultValue={data?.name}
          />
        </FormElement>

        <FormElement
          id="host"
          label={t("hostLabel")}
          error={
            hostError &&
            errorT(hostError.messageKey, {
              field: errorT(`fields.${hostError.field}`),
              indArticleCheck: "",
            })
          }
        >
          <input
            id="host"
            type="text"
            name="host"
            className="govie-input"
            defaultValue={data?.host}
          />
        </FormElement>

        <FormElement
          id="port"
          label={t("portLabel")}
          error={
            portError &&
            errorT(portError.messageKey, {
              field: errorT(`fields.${portError.field}`),
              indArticleCheck: "",
            })
          }
        >
          <input
            id="port"
            type="text"
            name="port"
            className="govie-input"
            defaultValue={data?.port}
          />
        </FormElement>

        <FormElement
          id="username"
          label={t("usernameLabel")}
          error={
            usernameError &&
            errorT(usernameError.messageKey, {
              field: errorT(`fields.${usernameError.field}`),
              indArticleCheck: "",
            })
          }
        >
          <input
            id="username"
            type="text"
            name="username"
            className="govie-input"
            defaultValue={data?.username}
          />
        </FormElement>

        <FormElement
          id="password"
          label={t("passwordLabel")}
          error={
            passwordError &&
            errorT(passwordError.messageKey, {
              field: errorT(`fields.${passwordError.field}`),
              indArticleCheck: "",
            })
          }
        >
          <input
            id="password"
            type="password"
            name="password"
            className="govie-input"
            defaultValue={data?.password}
          />
        </FormElement>

        <FormElement
          id="fromAddress"
          label={t("fromAddressLabel")}
          error={
            fromAddressError &&
            errorT(fromAddressError.messageKey, {
              field: errorT(`fields.${fromAddressError.field}`),
              indArticleCheck: "",
            })
          }
        >
          <input
            id="fromAddress"
            type="text"
            name="fromAddress"
            className="govie-input"
            defaultValue={data?.fromAddress}
          />
        </FormElement>

        <FormElement
          id="throttle"
          label={t("throttleLabel")}
          hint={t("throttleHint")}
          error={
            throttleError &&
            errorT(throttleError.messageKey, {
              field: errorT(`fields.${throttleError.field}`),
              indArticleCheck: "",
            })
          }
        >
          <input
            id="throttle"
            type="text"
            name="throttle"
            className="govie-input"
            defaultValue={data?.throttle}
          />
        </FormElement>

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
