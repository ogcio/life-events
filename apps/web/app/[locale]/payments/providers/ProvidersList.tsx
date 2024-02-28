import { useTranslations } from "next-intl";
import { PgSessions, pgpool } from "../../../sessions";
import ProviderStatus from "./ProviderStatus";

async function getProviders() {
  "use server";

  const { userId } = await PgSessions.get();

  const providersQueryResult = await pgpool.query<
    {
      provider_id: string,
      provider_name: string,
      provider_type: string,
      provider_data: any,
      status: string
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
      WHERE user_id = $1
    `,
    [userId]
  );

  if (!providersQueryResult.rowCount) {
    return [];
  }

  console.log(providersQueryResult.rows)
  return providersQueryResult.rows;
}

export default async () => {
  const t = useTranslations("payments.Providers.table");
  const providers = await getProviders()

  if (providers.length === 0) {
    return <p className="govie-body">{t('emptyMessage')}</p>
  }

  return (
    <table className="govie-table">
      <thead className="govie-table__head">
        <tr className="govie-table__row">
          <th scope="col" className="govie-table__header">{t('provider')}</th>
          <th scope="col" className="govie-table__header">{t('status')}</th>
          <th scope="col" className="govie-table__header">{t('account')}</th>
          <th scope="col" className="govie-table__header govie-table__header--numeric">{t('actions')}</th>
        </tr>
      </thead>
      <tbody className="govie-table__body">
        {
          providers.map(provider => (
            <tr className="govie-table__row">
              <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                {provider.provider_type}
              </td>
              <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                <ProviderStatus status={provider.status}></ProviderStatus>
              </td>
              <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">{provider.provider_name}</td>
              <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s govie-table__cell--numeric">12345</td>
            </tr>
          ))
        }

      </tbody>
    </table>
  )
}
