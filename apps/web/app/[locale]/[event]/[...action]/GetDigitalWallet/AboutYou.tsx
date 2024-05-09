import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { postgres, workflow } from "../../../../utils";
import ds from "design-system";

export default async (props: {
  data: workflow.GetDigitalWallet;
  userId: string;
  urlBase: string;
  flow: string;
}) => {
  const { data, userId, urlBase, flow } = props;
  const t = await getTranslations("GetDigitalWallet.AboutYou");

  const red = ds.colours.ogcio.red;

  async function submitAction(formData: FormData) {
    "use server";

    const newData: Pick<
      workflow.GetDigitalWallet,
      "firstName" | "lastName" | "myGovIdEmail" | "hasConfirmedPersonalDetails"
    > = {
      firstName: data.firstName,
      lastName: data.lastName,
      myGovIdEmail: data.myGovIdEmail,
      hasConfirmedPersonalDetails: true,
    };

    const currentDataResults = await postgres.pgpool.query<{
      currentData: workflow.GetDigitalWallet;
    }>(
      `
        SELECT flow_data as "currentData" FROM user_flow_data
        WHERE user_id = $1 AND flow = $2
    `,
      [userId, workflow.keys.getDigitalWallet],
    );

    let dataToUpdate: workflow.GetDigitalWallet;
    if (currentDataResults.rowCount) {
      const [{ currentData }] = currentDataResults.rows;
      Object.assign(currentData, newData);
      dataToUpdate = currentData;
    } else {
      const base: workflow.GetDigitalWallet = workflow.emptyGetDigitalWallet();
      Object.assign(base, newData);
      dataToUpdate = base;
    }

    await postgres.pgpool.query(
      `
        INSERT INTO user_flow_data (user_id, flow, flow_data, category)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (flow, user_id)
        DO UPDATE SET flow_data = $3
        WHERE user_flow_data.user_id=$1 AND user_flow_data.flow=$2
    `,
      [
        userId,
        workflow.keys.getDigitalWallet,
        JSON.stringify(dataToUpdate),
        workflow.categories.digitalWallet,
      ],
    );

    redirect(urlBase);
  }

  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds-from-desktop">
        <h1 className="govie-heading-l">{t("title")}</h1>
        <p className="govie-heading-s">{t("subTitle")}</p>
        <form action={submitAction} style={{ maxWidth: "590px" }}>
          <div className="govie-form-group">
            <h1 className="govie-label-wrapper">
              <label
                htmlFor="firstName"
                className="govie-label--s govie-label--l"
              >
                {t.rich("firstName", {
                  red: (chunks) => <span style={{ color: red }}>{chunks}</span>,
                })}
              </label>
            </h1>
            <input
              type="text"
              id="firstName"
              name="firstName"
              className="govie-input"
              defaultValue={data.firstName}
              disabled
            />
          </div>

          <div className="govie-form-group">
            <h1 className="govie-label-wrapper">
              <label
                htmlFor="lastName"
                className="govie-label--s govie-label--l"
              >
                {t.rich("lastName", {
                  red: (chunks) => <span style={{ color: red }}>{chunks}</span>,
                })}
              </label>
            </h1>
            <input
              type="text"
              id="lastName"
              name="lastName"
              className="govie-input"
              defaultValue={data.lastName}
              disabled
            />
          </div>

          <div className="govie-form-group">
            <h1 className="govie-label-wrapper">
              <label htmlFor="email" className="govie-label--s govie-label--l">
                {t.rich("myGovIdEmail", {
                  red: (chunks) => <span style={{ color: red }}>{chunks}</span>,
                })}
              </label>
            </h1>
            <input
              type="text"
              id="myGovIdEmail"
              name="myGovIdEmail"
              className="govie-input"
              defaultValue={data.myGovIdEmail}
              disabled
            />
          </div>

          <button type="submit" className="govie-button">
            {t("submitText")}
          </button>
        </form>
      </div>
    </div>
  );
};
