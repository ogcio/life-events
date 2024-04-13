import { getTranslations } from "next-intl/server";
import { PgSessions } from "auth/sessions";
import { redirect } from "next/navigation";
import { NextIntlClientProvider, AbstractIntlMessages } from "next-intl";
import { Payments } from "building-blocks-sdk";
import BankTransferForm from "./BankTransferForm";
import getRequestConfig from "../../../../../../i18n";

type Props = {
  params: {
    locale: string;
  };
};

export default async (props: Props) => {
  const t = await getTranslations("PaymentSetup.AddBankTransfer");
  const { messages } = await getRequestConfig({ locale: props.params.locale });

  const { userId } = await PgSessions.get();

  async function handleSubmit(
    prevState: FormData,
    formData: FormData,
  ): Promise<{
    errors: {
      [key: string]: string;
    };
  }> {
    "use server";

    const iban = formData.get("iban") as string;
    if (iban !== "123") {
      return {
        errors: {
          iban: "IBAN is not valid",
        },
      };
    }

    await new Payments(userId).createProvider({
      name: formData.get("provider_name") as string,
      type: "banktransfer",
      data: {
        iban: formData.get("iban"),
        accountHolderName: formData.get("account_holder_name"),
      },
    });

    redirect("./");
  }

  return (
    <NextIntlClientProvider
      messages={messages?.["PaymentSetup"] as AbstractIntlMessages}
    >
      <BankTransferForm action={handleSubmit} />
    </NextIntlClientProvider>
  );
};
