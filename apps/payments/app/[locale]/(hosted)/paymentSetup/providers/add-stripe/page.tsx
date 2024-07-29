import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { NextIntlClientProvider, AbstractIntlMessages } from "next-intl";
import getRequestConfig from "../../../../../../i18n";
import { errorHandler } from "../../../../../utils";
import StripeForm from "./StripeForm";
import { stripeValidationMap } from "../../../../../validationMaps";
import { AuthenticationFactory } from "../../../../../../libraries/authentication-factory";
import PaymentsMenu from "../../PaymentsMenu";

type Props = {
  params: {
    locale: string;
  };
};

export type StripeFormState = {
  errors: {
    [key: string]: string;
  };
  defaultState?: {
    providerName: string;
    livePublishableKey: string;
    liveSecretKey: string;
  };
};

export default async (props: Props) => {
  const t = await getTranslations("PaymentSetup.AddStripe");
  const { messages } = await getRequestConfig({ locale: props.params.locale });

  const errorFieldMapping = stripeValidationMap(t);

  const context = AuthenticationFactory.getInstance();
  const isPublicServant = await context.isPublicServant();
  if (!isPublicServant) return notFound();

  const organizations = Object.values(await context.getOrganizations());
  const defaultOrgId = await context.getSelectedOrganization();

  async function handleSubmit(
    prevState: FormData,
    formData: FormData,
  ): Promise<StripeFormState> {
    "use server";

    const paymentsApi = await AuthenticationFactory.getPaymentsClient();

    const nameField = formData.get("provider_name") as string;
    const livePublishableKeyField = formData.get(
      "live_publishable_key",
    ) as string;
    const liveSecretKeyField = formData.get("live_secret_key") as string;

    const formResult = {
      errors: {},
      defaultState: {
        providerName: nameField,
        livePublishableKey: livePublishableKeyField,
        liveSecretKey: liveSecretKeyField,
      },
    };

    const { data: result, error } = await paymentsApi.createProvider({
      name: nameField,
      type: "stripe",
      data: {
        liveSecretKey: liveSecretKeyField,
        livePublishableKey: livePublishableKeyField,
      },
    });

    formResult.errors = errorHandler(error, errorFieldMapping) ?? {};

    if (result) {
      redirect("./");
    }

    return formResult;
  }

  return (
    <div
      style={{
        display: "flex",
        marginTop: "1.3rem",
        gap: "2rem",
      }}
    >
      <PaymentsMenu
        locale={props.params.locale}
        organizations={organizations}
        defaultOrganization={defaultOrgId}
        disableOrgSelector={true}
      />
      <div>
        <section
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <NextIntlClientProvider
            messages={messages?.["PaymentSetup"] as AbstractIntlMessages}
          >
            <StripeForm action={handleSubmit} />
          </NextIntlClientProvider>
        </section>
      </div>
    </div>
  );
};
