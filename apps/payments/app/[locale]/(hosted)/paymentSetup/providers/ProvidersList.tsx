import Link from "next/link";
import { useTranslations } from "next-intl";
import { PgSessions } from "auth/sessions";
import ProviderStatusTag from "./ProviderStatusTag";
import { Payments } from "building-blocks-sdk";

export default async () => {
  const t = useTranslations("PaymentSetup.Providers.table");
  const { userId } = await PgSessions.get();
  const { data: providers } = await new Payments(userId).getProviders();

  if (providers && providers.length === 0) {
    return <p className="govie-body">{t("emptyMessage")}</p>;
  }

  return (
    <table className="govie-table">
      <thead className="govie-table__head">
        <tr className="govie-table__row">
          <th scope="col" className="govie-table__header">
            {t("provider")}
          </th>
          <th scope="col" className="govie-table__header">
            {t("status")}
          </th>
          <th scope="col" className="govie-table__header">
            {t("account")}
          </th>
          <th
            scope="col"
            className="govie-table__header govie-table__header--numeric"
          >
            {t("actions")}
          </th>
        </tr>
      </thead>
      <tbody className="govie-table__body">
        {providers &&
          providers.map((provider) => (
            <tr key={provider.id} className="govie-table__row">
              <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                {provider.type}
              </td>
              <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                <ProviderStatusTag status={provider.status}></ProviderStatusTag>
              </td>
              <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
                {provider.name}
              </td>
              <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s govie-table__header--numeric">
                <Link href={`providers/${provider.id}`}>{t("edit")}</Link>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};
