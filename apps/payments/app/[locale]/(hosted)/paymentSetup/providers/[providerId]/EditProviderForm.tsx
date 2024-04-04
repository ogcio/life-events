import { redirect } from "next/navigation";
import type { Provider } from "../types";
import type { PropsWithChildren } from "react";
import { getTranslations } from "next-intl/server";
import { PgSessions } from "auth/sessions";
import buildApiClient from "../../../../../../client/index";

type Props = {
  provider: Provider;
  updateProviderAction: (formData: FormData) => void;
};

export default async ({
  provider,
  updateProviderAction,
  children,
}: PropsWithChildren<Props>) => {
  const t = await getTranslations("PaymentSetup.Providers.edit");

  async function setProviderStatus(status: string) {
    "use server";

    const { userId } = await PgSessions.get();

    await buildApiClient(userId).providers.apiV1ProvidersProviderIdPut(
      provider.id,
      {
        name: provider.name,
        data: provider.data,
        status,
      },
    );

    redirect("./");
  }

  async function enableProvider() {
    "use server";
    return setProviderStatus("connected");
  }

  async function disableProvider() {
    "use server";
    return setProviderStatus("disconnected");
  }

  return (
    <form action={updateProviderAction}>
      {children}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          id="button"
          type="submit"
          data-module="govie-button"
          className="govie-button"
        >
          {t("save")}
        </button>
        {provider.status === "connected" && (
          <button
            id="button"
            data-module="govie-button"
            className="govie-button govie-button--tertiary"
            formAction={disableProvider}
          >
            {t("disable")}
          </button>
        )}
        {provider.status === "disconnected" && (
          <button
            id="button"
            data-module="govie-button"
            className="govie-button govie-button--secondary"
            formAction={enableProvider}
          >
            {t("enable")}
          </button>
        )}
      </div>
    </form>
  );
};
