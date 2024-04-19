import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getUser } from "../../../../../../libraries/auth";
import { NextIntlClientProvider, AbstractIntlMessages } from "next-intl";
import { Payments } from "building-blocks-sdk";
import BankTransferForm from "./BankTransferForm";
import getRequestConfig from "../../../../../../i18n";
import { getValidationErrors } from "../../../../../utils";

type Props = {
  params: {
    locale: string;
  };
};

export default async (props: Props) => {
  const t = await getTranslations("PaymentSetup.AddBankTransfer");
  const { messages } = await getRequestConfig({ locale: props.params.locale });

  const user = await getUser();

  async function handleSubmit(
    prevState: FormData,
    formData: FormData,
  ): Promise<{
    errors: {
      [key: string]: string;
    };
  }> {
    "use server";
    const validation = {
      errors: {},
    };

    const result = await new Payments(
      user.accessToken,
    ).createBankTransferProvider({
      name: formData.get("provider_name") as string,
      type: "banktransfer",
      data: {
        iban: (formData.get("iban") as string).replaceAll(" ", ""),
        accountHolderName: formData.get("account_holder_name") as string,
      },
    });

    if (result.data && !result.error) {
      redirect("./");
    }

    if (result.error.validation) {
      validation.errors = getValidationErrors(result.error.validation);
    }

    return validation;
  }

  return (
    <NextIntlClientProvider
      messages={messages?.["PaymentSetup"] as AbstractIntlMessages}
    >
      <BankTransferForm action={handleSubmit} />
    </NextIntlClientProvider>
  );
};
