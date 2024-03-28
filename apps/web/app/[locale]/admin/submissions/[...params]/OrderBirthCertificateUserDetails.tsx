import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { aws, postgres, routes, web, workflow } from "../../../../utils";
import { ListRow } from "../../../[event]/[...action]/shared/SummaryListRow";
import FormLayout from "../../../../components/FormLayout";
import { getS3ClientConfig } from "../../../../utils/aws";

type Props = {
  flowData: workflow.OrderBirthCertificate;
  flow: string;
  userId: string;
};

export default async ({ userId, flow, flowData }: Props) => {
  const t = await getTranslations("Admin.OrderBirthCertificateUserDetails");
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

  let proofOfAddressDownloadUrl: string | undefined;

  // New link is generated on each render, but expires after 5 minutes. This might not be desirable but there has been no specifications
  if (flowData.proofOfAddressFileId) {
    const s3Config = getS3ClientConfig();

    const command = new GetObjectCommand({
      Bucket: s3Config.bucketName,
      Key: `${userId}/${flowData.proofOfAddressFileId}`,
    });
    proofOfAddressDownloadUrl = await getSignedUrl(s3Config.client, command, {
      expiresIn: 5 * 60,
    });
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
      <div className="govie-heading-m">{flowData.userName}</div>
      <div className="govie-grid-row">
        <div className="govie-grid-column-two-thirds-from-desktop">
          <dl className="govie-summary-list">
            <ListRow item={{ key: t("name"), value: flowData.userName }} />
            <ListRow
              item={{
                key: t("birthDay"),
                value: !flowData.yearOfBirth
                  ? "-"
                  : web.formatDate(
                      `${flowData.yearOfBirth}-${flowData.monthOfBirth}-${flowData.dayOfBirth}`,
                    ),
              }}
            />
            <ListRow item={{ key: t("sex"), value: flowData.sex }} />
            <ListRow
              item={{
                key: t("address"),
                value: flowData.currentAddress,
              }}
            />
            <ListRow
              item={{
                key: t("addressVerified"),
                value: flowData.currentAddressVerified ? t("yes") : t("no"),
              }}
            />
            <ListRow
              item={{
                key: t("proofOfAddress"),
                value: proofOfAddressDownloadUrl ? (
                  <a target="_blank" href={proofOfAddressDownloadUrl}>
                    {t(flowData.proofOfAddressRequest)}
                  </a>
                ) : (
                  t(flowData.proofOfAddressRequest)
                ),
              }}
            />

            <ListRow item={{ key: t("mobile"), value: flowData.mobile }} />
            <ListRow item={{ key: t("email"), value: flowData.email }} />
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
