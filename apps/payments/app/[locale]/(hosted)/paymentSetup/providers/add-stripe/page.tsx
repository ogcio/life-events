import { getTranslations } from "next-intl/server";
import { getUser } from "../../../../../../libraries/auth";
import { redirect } from "next/navigation";
import { NextIntlClientProvider, AbstractIntlMessages } from "next-intl";
import { Payments } from "building-blocks-sdk";
import getRequestConfig from "../../../../../../i18n";
import { getValidationErrors } from "../../../../../utils";
import StripeForm from "./StripeForm";

type Props = {
  params: {
    locale: string;
  };
};

export default async (props: Props) => {
  const t = await getTranslations("PaymentSetup.AddStripe");
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

    const result = await new Payments(user.accessToken).createStripeProvider({
      name: formData.get("provider_name") as string,
      type: "stripe",
      data: {
        liveSecretKey: formData.get("live_secret_key") as string,
        livePublishableKey: formData.get("live_publishable_key") as string,
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
      <StripeForm action={handleSubmit} />
    </NextIntlClientProvider>
  );
};
