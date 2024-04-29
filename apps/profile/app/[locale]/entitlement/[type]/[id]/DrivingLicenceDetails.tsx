import { PgSessions } from "auth/sessions";
import { getTranslations } from "next-intl/server";
import { formatDate } from "../../../../utils";
import Link from "next/link";

async function getDrivingLicenceDetails(_id: string) {
  const { firstName, lastName } = await PgSessions.get();
  return {
    name: `${firstName} ${lastName}`,
    dateOfBirth: new Date("1990-01-01T00:00:00Z"),
    placeOfBirth: "Ireland",
    issueDate: "15/11/2022",
    expiryDate: "15/11/2032",
    issuedBy: "Road Safety Authority",
    driverNumber: "001234000",
    licenceNumber: "MURPH0523",
    address: "123 Main Street, Anytown, Co. Dublin",
    categories: "A, B",
  };
}

export default async ({ id }: { id: string }) => {
  const t = await getTranslations("DrivingLicenceDetails");
  const data = await getDrivingLicenceDetails(id);

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
              {t("datePlaceOfBirth")}
            </th>
            <td className="govie-table__cell">
              {formatDate(data.dateOfBirth)} {data.placeOfBirth}
            </td>
          </tr>
          <tr className="govie-table__row">
            <th className="govie-table__header" scope="row">
              <ol className="govie-list">
                <li style={{ fontWeight: "bold" }}>{t("issueDate")}</li>
                <li style={{ fontWeight: "bold" }}>{t("expiryDate")}</li>
                <li style={{ fontWeight: "bold" }}>{t("issuedBy")}</li>
                <li style={{ fontWeight: "bold" }}>{t("driverNumber")}</li>
              </ol>
            </th>
            <td className="govie-table__cell">
              <ol className="govie-list">
                <li>{data.issueDate}</li>
                <li>{data.expiryDate}</li>
                <li>{data.issuedBy}</li>
                <li>{data.driverNumber}</li>
              </ol>
            </td>
          </tr>
          <tr className="govie-table__row">
            <th className="govie-table__header" scope="row">
              {t("licenceNumber")}
            </th>
            <td className="govie-table__cell">{data.licenceNumber}</td>
          </tr>
          <tr className="govie-table__row">
            <th className="govie-table__header" scope="row">
              {t("address")}
            </th>
            <td className="govie-table__cell">{data.address}</td>
          </tr>
          <tr className="govie-table__row">
            <th className="govie-table__header" scope="row">
              {t("vehicleCategories")}
            </th>
            <td className="govie-table__cell">{data.categories}</td>
          </tr>
        </tbody>
      </table>
      <div style={{ margin: "30px 0" }}>
        <Link href={"/"} className="govie-back-link">
          {t("back")}
        </Link>
      </div>
    </div>
  );
};
