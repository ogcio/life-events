import { RedirectType, redirect } from "next/navigation";
import { postgres, web, workflow } from "../../../../../utils";
import { sendEmailConfirmationCompleteEmail } from "./ServerActions";

export default async (props: {
  data: workflow.GetDigitalWallet;
  flow: string;
  userId: string;
  searchParams: web.NextPageProps["searchParams"];
}) => {
  const { data, userId, flow, searchParams } = props;

  const token = searchParams?.token;

  let error = false;

  if (!token) {
    return redirect("/", RedirectType.replace);
  }

  const result = await postgres.pgpool.query(
    `
        SELECT flow_data FROM user_flow_data WHERE user_id = $1 AND email_verification_token = $2 and flow = $3
    `,
    [userId, token, flow],
  );

  if (!result.rows.length) {
    error = true;
  } else {
    const updatedData = {
      ...result.rows[0].flow_data,
      verifiedGovIEEmail: true,
    };

    try {
      await postgres.pgpool.query(
        `
      INSERT INTO user_flow_data (user_id, flow, flow_data, category, email_verification_token)
      VALUES ($1, $2, $3, $4, NULL)
      ON CONFLICT (flow, user_id)
      DO UPDATE SET 
      flow_data = EXCLUDED.flow_data,
      email_verification_token = NULL;
      `,
        [
          userId,
          workflow.keys.getDigitalWallet,
          JSON.stringify(updatedData),
          workflow.categories.digitalWallet,
        ],
      );

      await sendEmailConfirmationCompleteEmail(
        data.myGovIdEmail,
        data.firstName,
        data.lastName,
      );
    } catch (sqlError) {
      error = true;
      console.error(sqlError);
    }
  }

  return (
    <>
      <div className="govie-grid-row">
        <div className="govie-grid-column-two-thirds-from-desktop">
          <div className="govie-heading-l">
            {error ? (
              <>
                <p className="govie-body">
                  there was an error verifying your email
                </p>
              </>
            ) : (
              <>
                <p className="govie-body">
                  Email has been verified, click <a href="/">here</a> to go back
                  to Life Events
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
