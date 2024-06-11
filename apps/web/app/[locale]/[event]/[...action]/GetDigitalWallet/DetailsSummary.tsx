import { useTranslations } from "next-intl";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

import { ListRow } from "../shared/SummaryListRow";
import { workflow, postgres, routes, web } from "../../../../utils";
import {
  sendConfirmationEmail,
  sendGovAddressConfirmationEmail,
} from "./ServerActions";

export default (props: {
  data: workflow.GetDigitalWallet;
  flow: string;
  userId: string;
  urlBase: string;
}) => {
  const { data, flow, userId, urlBase } = props;
  const t = useTranslations("GetDigitalWallet.DetailsSummary");
  async function submitAction() {
    "use server";

    const { govIEEmail, appStoreEmail, firstName, lastName, myGovIdEmail } =
      data;

    const randomToken = crypto.randomBytes(16).toString("hex");

    const verifyUrl = `${process.env.HOST_URL}${urlBase}/verify-email?token=${randomToken}`;

    try {
      // await sendConfirmationEmail(myGovIdEmail, firstName, lastName);
      await sendGovAddressConfirmationEmail(
        govIEEmail,
        firstName,
        lastName,
        verifyUrl,
      );
    } catch (error) {
      console.error(error);
    }

    await postgres.pgpool.query(
      `
        UPDATE user_flow_data SET flow_data = flow_data || jsonb_build_object('confirmedApplication',now()::TEXT, 'submittedAt', now()), updated_at = now(), email_verification_token = $3
        WHERE user_id = $1 AND flow = $2
    `,
      [userId, flow, randomToken],
    );

    revalidatePath("/");
  }

  const changeDetailsHref =
    routes.digitalWallet.getDigitalWallet.changeDetails.slug;

  return (
    <>
      <div className="govie-grid-row">
        <div className="govie-grid-column-two-thirds-from-desktop">
          <div className="govie-heading-l">{t("title")}</div>
          <p className="govie-heading-s">{t("mygovidDataHeading")}</p>

          <dl className="govie-summary-list">
            <ListRow item={{ key: t("firstName"), value: data.firstName }} />
            <ListRow item={{ key: t("lastName"), value: data.lastName }} />
            <ListRow
              item={{
                key: t("myGovIdEmail"),
                value: data.myGovIdEmail,
              }}
            />
          </dl>

          <p className="govie-heading-s">{t("filledDataHeading")}</p>

          <dl className="govie-summary-list">
            <ListRow
              change={{ key: t("change"), value: changeDetailsHref }}
              item={{ key: t("govIEEmail"), value: data.govIEEmail }}
            />
            <ListRow
              change={{ key: t("change"), value: changeDetailsHref }}
              item={{
                key: t("selectDeviceText"),
                value: t(data.deviceType?.toString()),
              }}
            />
            <ListRow
              change={{ key: t("change"), value: changeDetailsHref }}
              item={{
                key: t(
                  data.deviceType === "ios"
                    ? "iosAppStoreEmail"
                    : "androidAppStoreEmail",
                ),
                value: data.appStoreEmail,
              }}
            />
          </dl>

          <form action={submitAction}>
            <button className="govie-button">{t("submitText")}</button>
          </form>
        </div>
      </div>
    </>
  );
};
