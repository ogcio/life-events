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
import { isFeatureFlagEnabled } from "feature-flags/utils";
import {
  getDigitalWalletRulesNotVerified,
  getDigitalWalletRulesVerified,
} from "./[...action]/GetDigitalWallet/GetDigitalWallet";

const eventRules = (flow: string, hasGovIdVerifiedAccount: boolean) => {
  switch (flow) {
    case workflow.keys.orderEHIC:
      return orderEHICRules;
    case workflow.keys.renewDriversLicence:
      return renewDriverLicenceRules;
    case workflow.keys.orderBirthCertificate:
      return orderBirthCertificateRules;
    case workflow.keys.notifyDeath:
      return notifyDeathRules;
    case workflow.keys.applyJobseekersAllowance:
      return applyJobseekersAllowanceRules;
    case workflow.keys.getDigitalWallet:
      return hasGovIdVerifiedAccount
        ? getDigitalWalletRulesVerified
        : getDigitalWalletRulesNotVerified;
    default:
      throw new Error(`Unsupported workflow: ${flow}`);
  }
};

async function getEvents() {
  "use server";

  return Promise.resolve([
    // All the commented out events are now reachable via the burger menu
    // {
    //   flowKey: workflow.keys.renewDriversLicence,
    //   category: workflow.categories.driving,
    // },
    // {
    //   flowKey: workflow.keys.orderEHIC,
    //   category: workflow.categories.health,
    // },
    // {
    //   flowKey: workflow.keys.orderBirthCertificate,
    //   category: workflow.categories.birth,
    // },
    // {
    //   flowKey: workflow.keys.notifyDeath,
    //   category: workflow.categories.death,
    // },
    // {
    //   flowKey: workflow.keys.applyJobseekersAllowance,
    //   category: workflow.categories.employment,
    // },
    {
      flowKey: workflow.keys.getDigitalWallet,
      category: workflow.categories.digitalWallet,
    },
  ]);
}

function eventFlowMapper(
  row: {
    flow: string;
    category: string;
    data: workflow.Workflow;
  },
  hasGovIdVerifiedAccount: boolean,
) {
  const flowKey = row.flow;
  let descriptionKey = row.flow;
  let titleKey = row.flow;

  const { key: step } = workflow.getCurrentStep(
    eventRules(row.flow, hasGovIdVerifiedAccount),
    row.data,
  );

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

async function getFlows(hasGovIdVerifiedAccount: boolean) {
  "use server";

  const { userId } = await PgSessions.get();

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

  return flowsQueryResult.rows.map((row) =>
    eventFlowMapper(row, hasGovIdVerifiedAccount),
  );
}

export default async ({ locale }) => {
  const t = await getTranslations("MyLifeEvents");
  const { userId, hasGovIdVerifiedAccount } = await PgSessions.get();
  const [flow, events] = await Promise.all([
    getFlows(hasGovIdVerifiedAccount),
    getEvents(),
  ]);

  const { data: messageEvents } = await new Messaging(userId).getMessages(
    "event",
  );

  const showDigitalWalletOnboarding =
    await isFeatureFlagEnabled("digitalWallet");

  const eventsToRender = events
    .filter((event) => !flow.some((f) => f.flowKey === event.flowKey))
    .map((event) => {
      const flowTitle = event.flowKey + ".title.base";
      const descriptionKey = event.flowKey + ".description.base";
      return {
        flowTitle,
        flowKey: event.flowKey,
        descriptionKey,
        slug: routes.category[event.category][event.flowKey].path(),
      };
    });

  return (
    <div style={{ display: "flex", flexWrap: "wrap", flex: 1, gap: "2.5rem" }}>
      <section style={{ margin: "1rem 0", flex: 1, minWidth: "400px" }}>
        <div className="govie-heading-l">{t("lifeEvents")}</div>
        <ul className="govie-list">
          {showDigitalWalletOnboarding &&
            eventsToRender.map((evt) => (
              <li
                key={`le_${evt.flowKey}`}
                style={{
                  margin: "1rem 0",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-around",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <Link className="govie-link" href={evt.slug}>
                      {evt.flowKey === workflow.keys.getDigitalWallet
                        ? t(evt.flowTitle, {
                            hasGovIdVerifiedAccount:
                              hasGovIdVerifiedAccount.toString(),
                          })
                        : t(evt.flowTitle)}
                    </Link>
                    <p
                      className="govie-body"
                      style={{ margin: "unset", marginTop: "16px" }}
                    >
                      {evt.flowKey === workflow.keys.getDigitalWallet
                        ? t.rich(evt.descriptionKey, {
                            hasGovIdVerifiedAccount:
                              hasGovIdVerifiedAccount.toString(),
                            br: () => <br />,
                          })
                        : t(evt.descriptionKey, { date: "19th March" })}
                    </p>
                  </div>
                  <div>
                    <Link
                      className="govie-link"
                      href={evt.slug}
                      aria-label={
                        evt.flowKey === workflow.keys.getDigitalWallet
                          ? t(evt.flowTitle, {
                              hasGovIdVerifiedAccount:
                                hasGovIdVerifiedAccount.toString(),
                            })
                          : t(evt.flowTitle)
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="10"
                        height="13"
                        fill="none"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="m0 0 5.753 6.5L0 13h4.247l4.78-5.4L10 6.5l-.974-1.1L4.247 0H0Z"
                          fill="#2C55A2"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
                <hr className="govie-section-break govie-section-break--visible" />
              </li>
            ))}
          {!showDigitalWalletOnboarding &&
            messageEvents?.map((msg) => (
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
      <section style={{ margin: "1rem 0", flex: 1, minWidth: "400px" }}>
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
