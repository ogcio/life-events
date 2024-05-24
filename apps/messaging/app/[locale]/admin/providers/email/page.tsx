import { Messaging } from "building-blocks-sdk";
import FlexMenuWrapper from "../../PageWithMenuFlexWrapper";
import { PgSessions } from "auth/sessions";
import { temporaryMockUtils } from "messages";
import { redirect } from "next/navigation";
import { providerRoutes } from "../../../../utils/routes";
import { revalidatePath } from "next/cache";
import { FormElement } from "../../FormElement";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
const defaultErrorStateId = "email_provider_form";

export default async (props: { searchParams?: { id: string } }) => {
  const [t, tError] = await Promise.all([
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

    const url = new URL(providerRoutes.url, process.env.HOST_URL);
    url.searchParams.append("provider", "email");
    redirect(url.href);
  }

  const { userId } = await PgSessions.get();
  const client = new Messaging(userId);

  let data:
    | Awaited<ReturnType<typeof client.getEmailProvider>>["data"]
    | undefined;

  if (props.searchParams?.id) {
    const res = await new Messaging(userId).getEmailProvider(
      props.searchParams.id,
    );
    if (res.data) {
      data = res.data;
    }
  }

  const errors = await temporaryMockUtils.getErrors(
    userId,
    props.searchParams?.id || defaultErrorStateId,
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
    <FlexMenuWrapper>
      <h1>
        <span className="govie-heading-l">
          {data?.id ? t("titleUpdate") : t("titleAdd")}
        </span>
      </h1>
      <form action={submitAction}>
        <input name="id" value={props.searchParams?.id} type="hidden" />
        <FormElement
          id="name"
          label={t("nameLabel")}
          error={
            nameError &&
            tError(nameError.messageKey, {
              field: tError(`fields.${nameError.field}`),
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
            tError(hostError.messageKey, {
              field: tError(`fields.${hostError.field}`),
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
            tError(portError.messageKey, {
              field: tError(`fields.${portError.field}`),
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
            tError(usernameError.messageKey, {
              field: tError(`fields.${usernameError.field}`),
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
            tError(passwordError.messageKey, {
              field: tError(`fields.${passwordError.field}`),
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
            tError(fromAddressError.messageKey, {
              field: tError(`fields.${fromAddressError.field}`),
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
            tError(throttleError.messageKey, {
              field: tError(`fields.${throttleError.field}`),
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
          {props.searchParams?.id ? t("updateButton") : t("createButton")}
        </button>
      </form>
      <Link className="govie-back-link" href={"./"}>
        {t("backLink")}
      </Link>
    </FlexMenuWrapper>
  );
};
