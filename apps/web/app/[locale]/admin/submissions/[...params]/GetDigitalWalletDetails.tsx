import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { postgres, routes, web, workflow } from "../../../../utils";
import { ListRow } from "../../../[event]/[...action]/shared/SummaryListRow";
import FormLayout from "../../../../components/FormLayout";
import { getS3ClientConfig } from "../../../../utils/aws";

type Props = {
  flowData: workflow.GetDigitalWallet;
  flow: string;
  userId: string;
};

export default async ({ userId, flow, flowData }: Props) => {
  const t = await getTranslations("Admin.GetDigitalWalletDetails");
  async function approveAction(formData: FormData) {
    "use server";
    const userId = formData.get("userId");
    const flow = formData.get("flow");

    await postgres.pgpool.query(
      `
            UPDATE user_flow_data set flow_data = flow_data || jsonb_build_object('successfulAt', now()::DATE::TEXT), updated_at = now()
            WHERE user_id=$1 AND flow = $2
        `,
      [userId, flow],
    );

    redirect("/admin");
  }

  return (
    <FormLayout
      action={{ slug: "submissions." + flow }}
      backHref={`/${routes.admin.slug}`}
      homeHref={`/${routes.admin.slug}`}
    >
      <div className="govie-heading-l">
        {t("title", { flow: t(flow).toLowerCase() })}
      </div>
      <div className="govie-heading-m">
        {flowData.firstName} {flowData.lastName}
      </div>
      <div className="govie-grid-row">
        <div className="govie-grid-column-two-thirds-from-desktop">
          <dl className="govie-summary-list">
            <ListRow
              item={{ key: t("firstName"), value: flowData.firstName }}
            />
            <ListRow
              item={{
                key: t("lastName"),
                value: flowData.lastName,
              }}
            />
            <ListRow
              item={{ key: t("myGovIdEmail"), value: flowData.myGovIdEmail }}
            />
            <ListRow
              item={{
                key: t("govIEEmail"),
                value: flowData.govIEEmail,
              }}
            />

            <ListRow
              item={{
                key: t("selectDeviceText"),
                value: t(flowData.deviceType?.toString()),
              }}
            />
            <ListRow
              item={{
                key: t(
                  flowData.deviceType === "ios"
                    ? "iosAppStoreEmail"
                    : "androidAppStoreEmail",
                ),
                value: flowData.appStoreEmail,
              }}
            />
          </dl>
        </div>
      </div>

      <form
        action={approveAction}
        style={{ display: "flex", alignItems: "baseline", gap: "20px" }}
      >
        <input type="hidden" name="userId" defaultValue={userId} />
        <input type="hidden" name="flow" defaultValue={flow} />
        <Link
          className="govie-link"
          href={
            new URL(
              `${headers().get("x-pathname")}/reject`,
              process.env.HOST_URL,
            ).href
          }
        >
          {t("reject")}
        </Link>
        <button type="submit" className="govie-button govie-button--medium">
          {t("approve")}
        </button>
      </form>
    </FormLayout>
  );
};
