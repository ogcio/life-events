import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import buildApiClient from "../../../../../../client/index";
import BankTransferFields from "./BankTransferFields";
import { getUser } from "../../../../../../libraries/auth";

export default async () => {
  const t = await getTranslations("PaymentSetup.AddBankTransfer");

  const user = await getUser();

  async function handleSubmit(formData: FormData) {
    "use server";

    await buildApiClient(user.accessToken).providers.apiV1ProvidersPost({
      name: formData.get("provider_name") as string,
      type: "banktransfer",
      data: {
        sortCode: formData.get("sort_code"),
        accountNumber: formData.get("account_number"),
        accountHolderName: formData.get("account_holder_name"),
      },
    });

    redirect("./");
  }

  return (
    <form action={handleSubmit}>
      <legend className="govie-fieldset__legend govie-fieldset__legend--m">
        <h1 className="govie-fieldset__heading">{t("title")}</h1>
      </legend>
      <BankTransferFields />
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
