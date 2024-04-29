import { PgSessions } from "auth/sessions";
import { getTranslations } from "next-intl/server";
import { formatDate } from "../../../../utils";
import Link from "next/link";

async function getBirthCertificateeDetails(_id: string) {
  const { firstName, lastName } = await PgSessions.get();
  return {
    name: `${firstName} ${lastName}`,
    dateOfBirth: new Date("1990-01-01T00:00:00Z"),
    gender: "male",
    placeOfBirth: "Ireland",
    motherName: "Maria Murphy",
    issueDate: "02/01/1990",
    certificateNumber: "0523789",
  };
}

export default async ({ id, locale }: { id: string; locale: string }) => {
  const t = await getTranslations("BirthCertificateDetails");
  const data = await getBirthCertificateeDetails(id);

  return (
    <div className="govie-grid-column-two-thirds-from-desktop">
      <h1 className="govie-heading-m">{t("title")}</h1>
      <table className="govie-table">
        <tbody className="govie-table__body">
          <tr className="govie-table__row">
            <th className="govie-table__header" scope="row">
              {t("name")}
            </th>
            <td className="govie-table__cell">{data.name}</td>
          </tr>
          <tr className="govie-tcpable__row">
            <th className="govie-table__header" scope="row">
              {t("dateOfBirth")}
            </th>
            <td className="govie-table__cell">
              {formatDate(data.dateOfBirth)}
            </td>
          </tr>
          <tr className="govie-tcpable__row">
            <th className="govie-table__header" scope="row">
              {t("placeOfBirth")}
            </th>
            <td className="govie-table__cell">{data.placeOfBirth}</td>
          </tr>
          <tr className="govie-table__row">
            <th className="govie-table__header" scope="row">
              {t("motherName")}
            </th>
            <td className="govie-table__cell">{data.motherName}</td>
          </tr>
          <tr className="govie-table__row">
            <th className="govie-table__header" scope="row">
              {t("issueDate")}
            </th>
            <td className="govie-table__cell">{data.issueDate}</td>
          </tr>
          <tr className="govie-table__row">
            <th className="govie-table__header" scope="row">
              {t("certificateNumber")}
            </th>
            <td className="govie-table__cell">{data.certificateNumber}</td>
          </tr>
        </tbody>
      </table>
      <div style={{ margin: "30px 0" }}>
        <Link href={`/${locale}`} className="govie-back-link">
          {t("back")}
        </Link>
      </div>
    </div>
  );
};
