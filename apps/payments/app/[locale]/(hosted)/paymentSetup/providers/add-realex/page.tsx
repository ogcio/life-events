import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import getRequestConfig from "../../../../../../i18n";
import { errorHandler } from "../../../../../utils";
import RealexForm from "./RealexForm";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { realexValidationMap } from "../../../../../validationMaps";
import { AuthenticationFactory } from "../../../../../../libraries/authentication-factory";
import PaymentsMenu from "../../PaymentsMenu";

type Props = {
  params: {
    locale: string;
  };
};

export type RealexFormState = {
  errors: {
    [key: string]: string;
  };
  defaultState: {
    providerName: string;
    merchantId: string;
    sharedSecret: string;
  };
};

export default async (props: Props) => {
  const t = await getTranslations("PaymentSetup.AddRealex");
  const { messages } = await getRequestConfig({ locale: props.params.locale });

  const context = AuthenticationFactory.getInstance();
  const isPublicServant = await context.isPublicServant();
  if (!isPublicServant) return notFound();

  const organizations = Object.values(await context.getOrganizations());
  const defaultOrgId = await context.getSelectedOrganization();

  const errorFieldMapping = realexValidationMap(t);

  async function handleSubmit(
    prevState: FormData,
    formData: FormData,
  ): Promise<RealexFormState> {
    "use server";
    const paymentsApi = await AuthenticationFactory.getPaymentsClient();
    const nameField = formData.get("provider_name") as string;
    const merchantIdField = formData.get("merchant_id") as string;
    const sharedSecretField = formData.get("shared_secret") as string;

    const formResult = {
      errors: {},
      defaultState: {
        providerName: nameField,
        merchantId: merchantIdField,
        sharedSecret: sharedSecretField,
      },
    };

    const { data: result, error } = await paymentsApi.createProvider({
      name: nameField,
      type: "realex",
      data: {
        merchantId: merchantIdField,
        sharedSecret: sharedSecretField,
      },
    });

    formResult.errors = errorHandler(error, errorFieldMapping) ?? {};

    if (result) redirect("./");

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
            <RealexForm action={handleSubmit} />
          </NextIntlClientProvider>
        </section>
      </div>
    </div>
  );
};
