import Link from "next/link";
import { web } from "../../../utils";
import { AuthServicePgSessions } from "auth/sessions";
import ds from "design-system";

const opaque = ds.hexToRgba(ds.colours.ogcio.gold, 5);

export default async (props: web.NextPageProps) => {
  const { firstName, lastName } = await AuthServicePgSessions.get();

  const userName = [firstName, lastName].join(" ");
  const searchParams = new URLSearchParams(props.searchParams);
  const locale = props.params.locale;

  return (
    <div
      style={{
        display: "flex",
        margin: "1.3rem 0",
        gap: "2.5rem",
      }}
    >
      <ol
        className="govie-list govie-list--spaced"
        style={{
          width: "200px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Link
          href={
            props.searchParams?.viewMode
              ? `/${locale}/timeline?${searchParams.toString()}`
              : `/${locale}/events`
          }
          className="govie-back-link"
          style={{ marginTop: "0" }}
        >
          Back
        </Link>
      </ol>
      <div className="govie-grid-column-two-thirds-from-desktop">
        <h1 className="govie-heading-m">Driving licence details</h1>
        <table className="govie-table">
          <tbody className="govie-table__body">
            <tr className="govie-table__row">
              <th className="govie-table__header" scope="row">
                Name
              </th>
              <td className="govie-table__cell">{userName}</td>
            </tr>
            <tr className="govie-table__row">
              <th className="govie-table__header" scope="row">
                Date and Place of Birth
              </th>
              <td className="govie-table__cell">12/05/1978 Ireland</td>
            </tr>
            <tr className="govie-table__row">
              <th className="govie-table__header" scope="row">
                <ol className="govie-list">
                  <li style={{ fontWeight: "bold" }}>Date of issue</li>
                  <li style={{ fontWeight: "bold" }}>Date of expiry</li>
                  <li style={{ fontWeight: "bold" }}>Issued by</li>
                  <li style={{ fontWeight: "bold" }}>Driver number</li>
                </ol>
              </th>
              <td className="govie-table__cell">
                <ol className="govie-list">
                  <li>15/11/2022</li>
                  <li>15/11/2032</li>
                  <li>Road Safety Authority</li>
                  <li>0001234000</li>
                </ol>
              </td>
            </tr>
            <tr className="govie-table__row">
              <th className="govie-table__header" scope="row">
                Licence number
              </th>
              <td className="govie-table__cell">XY7856RZ</td>
            </tr>
            <tr className="govie-table__row">
              <th className="govie-table__header" scope="row">
                Address
              </th>
              <td className="govie-table__cell">
                123 Main Street, Anytown, Co. Dublin
              </td>
            </tr>
            <tr className="govie-table__row">
              <th className="govie-table__header" scope="row">
                Vehicle categories
              </th>
              <td className="govie-table__cell">A, B</td>
            </tr>
          </tbody>
        </table>
        <h2 className="govie-heading-s">Related events</h2>
        <div>
          <ol className="govie-list">
            <li>
              <div
                style={{
                  backgroundColor: opaque,
                  padding: "12px",
                  marginBottom: "16px",
                }}
              >
                <p className="govie-body" style={{ marginBottom: 0 }}>
                  15/11/2022
                </p>
                <p className="govie-body">Driving licence issued</p>
              </div>
            </li>
            <li>
              <div
                style={{
                  backgroundColor: opaque,
                  padding: "12px",
                  marginBottom: "16px",
                }}
              >
                <p className="govie-body" style={{ marginBottom: 0 }}>
                  15/11/2022
                </p>
                <p className="govie-body">
                  Driving licence added to digital wallet
                </p>
              </div>
            </li>
            <li>
              <div
                style={{
                  backgroundColor: opaque,
                  padding: "12px",
                  marginBottom: "16px",
                }}
              >
                <p className="govie-body" style={{ marginBottom: 0 }}>
                  13/11/2022
                </p>
                <p className="govie-body">Applied for new driving licence</p>
              </div>
            </li>
            <li>
              <div
                style={{
                  backgroundColor: opaque,
                  padding: "12px",
                  marginBottom: "16px",
                }}
              >
                <p className="govie-body" style={{ marginBottom: 0 }}>
                  13/11/2022
                </p>
                <p className="govie-body">Paid for new driving licence</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
