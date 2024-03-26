import { getTranslations } from "next-intl/server";
import { PgSessions } from "auth/sessions";
import { redirect } from "next/navigation";
import { pgpool } from "../../../../../dbConnection";
import OpenBankingFields from "./OpenBankingFields";
import axios from "axios";
import { ProvidersApi } from "../../../../../../client";

const buildAxiosInstance = (userId) => {
  const instance = axios.create({});
  instance.defaults.headers.common["x-user-id"] = userId;
  return instance;
};

export default async () => {
  const t = await getTranslations("PaymentSetup.AddOpenbanking");

  const { userId } = await PgSessions.get();

  async function handleSubmit(formData: FormData) {
    "use server";

    const providersApi = new ProvidersApi(
      undefined, //Eventually we will add here the token for the user
      "http://localhost:8080",
      buildAxiosInstance(userId), //This will not be required anymore
    );
    await providersApi.apiV1ProvidersPost({
      name: formData.get("provider_name") as string,
      type: "openbanking",
      providerData: {
        sortCode: formData.get("sort_code") as string,
        accountNumber: formData.get("account_number") as string,
        accountHolderName: formData.get("account_holder_name") as string,
      },
    });

    redirect("./");
  }

  return (
    <form action={handleSubmit}>
      <legend className="govie-fieldset__legend govie-fieldset__legend--m">
        <h1 className="govie-fieldset__heading">{t("title")}</h1>
      </legend>
      <OpenBankingFields />
      <button
        id="button"
        type="submit"
        data-module="govie-button"
        className="govie-button"
      >
        {t("confirm")}
      </button>
    </form>
  );
};
