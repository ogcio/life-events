import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { PgSessions } from "auth/sessions";
import OpenEventStatusImage from "./components/OpenEventStatusImage";
import { renewDriverLicenceRules } from "./[...action]/RenewDriversLicence/RenewDriversLicence";
import { postgres, routes, workflow } from "../../utils";
import { orderEHICRules } from "./[...action]/OrderEHIC/OrderEHIC";
import { orderBirthCertificateRules } from "./[...action]/OrderBirthCertificate/OrderBirthCertificate";
import { notifyDeathRules } from "./[...action]/NotifyDeath/NotifyDeath";
import { applyJobseekersAllowanceRules } from "./[...action]/ApplyJobseekersAllowance/ApplyJobseekersAllowance";
import { Messaging } from "building-blocks-sdk";
import styles from "./event.module.scss";

const eventRules = {
  [workflow.keys.orderEHIC]: orderEHICRules,
  [workflow.keys.renewDriversLicence]: renewDriverLicenceRules,
  [workflow.keys.orderBirthCertificate]: orderBirthCertificateRules,
  [workflow.keys.notifyDeath]: notifyDeathRules,
  [workflow.keys.applyJobseekersAllowance]: applyJobseekersAllowanceRules,
};

async function getEvents() {
  "use server";

  return Promise.resolve([
    {
      flowKey: workflow.keys.renewDriversLicence,
      category: workflow.categories.driving,
    },
    {
      flowKey: workflow.keys.orderEHIC,
      category: workflow.categories.health,
    },
    {
      flowKey: workflow.keys.orderBirthCertificate,
      category: workflow.categories.birth,
    },
    {
      flowKey: workflow.keys.notifyDeath,
      category: workflow.categories.death,
    },
    {
      flowKey: workflow.keys.applyJobseekersAllowance,
      category: workflow.categories.employment,
    },
  ]);
}

function eventFlowMapper(row: {
  flow: string;
  category: string;
  data: workflow.Workflow;
}) {
  const flowKey = row.flow;
  let descriptionKey = row.flow;
  let titleKey = row.flow;

  const { key: step } = workflow.getCurrentStep(eventRules[row.flow], row.data);

  let successful = false;
  if (row.data.successfulAt) {
    successful = true;
    descriptionKey += ".description.post";
    titleKey += ".title.post";
  } else if (row.data.rejectReason) {
    titleKey += ".title.rejected";
    descriptionKey += ".description.rejected";
  } else if (
    [
      routes.category[row.category][row.flow].notificationSuccess?.slug,
      routes.category[row.category][row.flow].applicationSuccess?.slug,
      routes.category[row.category][row.flow].paymentSuccess?.slug,
    ].includes(step || "")
  ) {
    successful = true;
    descriptionKey += ".description.mid";
    titleKey += ".title.mid";
  } else {
    descriptionKey += ".description.pre";
    titleKey += ".title.pre";
  }

  return {
    successful,
    flowKey,
    titleKey,
    descriptionKey: descriptionKey,
    rejectedReaason: row.data.rejectReason,
    category: row.category,
    slug: routes.category[row.category][row.flow].path(),
  };
}

async function getFlows() {
  "use server";

  const { userId } = await PgSessions.get();

  // union the other flow types when we have them and add some type guard to figure out the pre/mid/post states
  const flowsQueryResult = await postgres.pgpool.query<
    { flow: string; category: string; data: workflow.Workflow },
    string[]
  >(
    `
      SELECT
        flow,
        category,
        flow_data as "data"
      FROM user_flow_data
      WHERE user_id = $1
  `,
    [userId],
  );

  if (!flowsQueryResult.rowCount) {
    return [];
  }

  return flowsQueryResult.rows.map(eventFlowMapper);
}

export default async ({ locale }) => {
  const t = await getTranslations("MyLifeEvents");
  const [flow] = await Promise.all([getFlows(), getEvents()]);

  const { userId } = await PgSessions.get();

  const { data: messageEvents } = await new Messaging(userId).getMessages(
    "event",
  );

  return (
    <div className={styles.landingPageSectionsWrapper}>
      <section className={styles.section}>
        <div className="govie-heading-l">{t("lifeEvents")}</div>
        <ul className="govie-list">
          {messageEvents?.map((msg) => (
            <li
              key={msg.subject}
              style={{
                margin: "1rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-around",
                gap: "1rem",
              }}
            >
              <Link
                className="govie-link"
                href={
                  new URL(
                    `/${locale}/messages/${msg.id}`,
                    process.env.MESSAGES_HOST_URL,
                  ).href
                }
              >
                {msg.subject}
              </Link>
              <p className="govie-body" style={{ margin: "unset" }}>
                {msg.excerpt}
              </p>
              <hr className="govie-section-break govie-section-break--visible" />
            </li>
          ))}
        </ul>
      </section>
      <section className={styles.section}>
        <div className="govie-heading-l">{t("openEvents")}</div>
        <ul className="govie-list">
          {flow.map((evt) => (
            <li
              key={`o_${evt.flowKey}`}
              style={{
                margin: "0 0 3rem",
                display: "flex",
                justifyContent: "space-around",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              <OpenEventStatusImage finished={evt.successful} />
              <div style={{ flex: 1 }}>
                <Link className="govie-link" href={evt.slug}>
                  {t(evt.titleKey)}
                </Link>
                <p
                  className="govie-body"
                  style={{ margin: "unset", overflow: "auto" }}
                >
                  {t(evt.descriptionKey, {
                    date: "19th March",
                    rejectedReason: evt.rejectedReaason,
                  })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
