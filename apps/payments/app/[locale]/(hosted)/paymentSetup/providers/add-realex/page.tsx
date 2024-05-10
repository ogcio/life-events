import { PgSessions } from "auth/sessions";
import { redirect } from "next/navigation";
import { Payments } from "building-blocks-sdk";
import getRequestConfig from "../../../../../../i18n";
import { errorHandler, getValidationErrors } from "../../../../../utils";
import RealexForm from "./RealexForm";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";

type Props = {
  params: {
    locale: string;
  };
};

export default async (props: Props) => {
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

    const validation = { errors: {} };


    const { data: result, error } = await new Payments(
      userId,
    ).createProvider({
      name: formData.get("provider_name") as string,
      type: "realex",
      data: {
        merchantId: formData.get("merchant_id") as string,
        sharedSecret: formData.get("shared_secret") as string,
      },
    });

    if (error) {
      errorHandler(error);
    }

    if (result) redirect("./");

    if (error.validation) {
      validation.errors = getValidationErrors(error.validation);
    }

    return validation;
  }

  return (
    <NextIntlClientProvider
      messages={messages?.["PaymentSetup"] as AbstractIntlMessages}
    >
      <RealexForm action={handleSubmit} />
    </NextIntlClientProvider>
  );
};
