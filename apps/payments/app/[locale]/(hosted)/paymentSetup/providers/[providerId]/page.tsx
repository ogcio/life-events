import { pgpool } from "../../../../../dbConnection";
import { redirect } from "next/navigation";
import EditOpenBankingForm from "./EditOpenBankingForm";
import {
  Provider,
  ProviderData,
  ProviderStatus,
  ProviderType,
  parseProvider,
} from "../types";
import EditBankTransferForm from "./EditBankTransferForm";

async function getProvider(providerId: string): Promise<Provider> {
  "use server";

  const providersQueryResult = await pgpool.query<
    {
      provider_id: string;
      provider_name: string;
      provider_type: ProviderType;
      provider_data: ProviderData;
      status: ProviderStatus;
    },
    string[]
  >(
    `
      SELECT
        provider_id,
        provider_name,
        provider_type,
        provider_data,
        status
      FROM payment_providers
      WHERE provider_id = $1
    `,
    [providerId],
  );

  if (!providersQueryResult.rowCount) {
    redirect("/paymentSetup/providers");
  }

  return parseProvider(providersQueryResult.rows[0]);
}

type Props = {
  params: {
    providerId: string;
  };
};

export default async ({ params: { providerId } }: Props) => {
  const provider = await getProvider(providerId);

  if (provider.type === "openbanking") {
    return <EditOpenBankingForm provider={provider} />;
  }

  if (provider.type === "banktransfer") {
    return <EditBankTransferForm provider={provider} />;
  }

  redirect("/paymentsetup/providers");
};
