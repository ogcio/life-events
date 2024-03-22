import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { PgSessions } from "auth/sessions";
import OpenEventStatusImage from "./OpenEventStatusImage";
import { renewDriverLicenceRules } from "./[...action]/RenewDriversLicence/RenewDriversLicence";
import { postgres, routes, workflow } from "../../utils";
import { orderEHICRules } from "./[...action]/OrderEHIC/OrderEHIC";
import { api } from "messages";
import { orderBirthCertificateRules } from "./[...action]/OrderBirthCertificate/OrderBirthCertificate";
import { notifyDeathRules } from "./[...action]/NotifyDeath/NotifyDeath";

const eventRules = {
  [workflow.keys.orderEHIC]: orderEHICRules,
  [workflow.keys.renewDriversLicence]: renewDriverLicenceRules,
  [workflow.keys.orderBirthCertificate]: orderBirthCertificateRules,
  [workflow.keys.notifyDeath]: notifyDeathRules,
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
      category: workflow.categories.health,
    },
    {
      flowKey: workflow.keys.notifyDeath,
      category: workflow.categories.death,
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

export default async () => {
  const t = await getTranslations("MyLifeEvents");
  const [flow, events] = await Promise.all([getFlows(), getEvents()]);

  const { email } = await PgSessions.get();
  const messageEvents = await api.getMessages(email, {
    page: 1,
    search: "",
    size: 10,
  });

  // const eventsToRender = events
  //   .filter((event) => !flow.some((f) => f.flowKey === event.flowKey))
  //   .map((event) => {
  //     // do some mapping for flow key
  //     const flowTitle = event.flowKey + ".title.base";
  //     const descriptionKey = event.flowKey + ".description.base";
  //     return {
  //       flowTitle,
  //       flowKey: event.flowKey,
  //       descriptionKey,
  //       slug: routes.category[event.category][event.flowKey].path(),
  //     };
  //   });

  return (
    <div style={{ display: "flex", flexWrap: "wrap", flex: 1 }}>
      <code>Mail: {email}</code>
      <section style={{ margin: "1rem 0", flex: 1, minWidth: "400px" }}>
        <div className="govie-heading-l">My Life Events</div>
        <ul className="govie-list">
          {messageEvents.map((msg) => (
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
                    `messages/${msg.messageId}`,
                    process.env.MESSAGES_HOST_URL,
                  ).href
                }
              >
                {msg.subject}
              </Link>
              <p className="govie-body" style={{ margin: "unset" }}>
                {msg.content}
              </p>
              <hr className="govie-section-break govie-section-break--visible" />
            </li>
          ))}
          {/* {eventsToRender.map((evt) => (
            <li
              key={`le_${evt.flowKey}`}
              style={{
                margin: "1rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-around",
                gap: "1rem",
              }}
            >
              <Link className="govie-link" href={evt.slug}>
                {t(evt.flowTitle)}
              </Link>
              <p className="govie-body" style={{ margin: "unset" }}>
                {t(evt.descriptionKey, { date: "19th March" })}
              </p>
              <hr className="govie-section-break govie-section-break--visible" />
            </li>
          ))} */}
        </ul>
      </section>
      <section style={{ margin: "1rem 0", flex: 1, minWidth: "400px" }}>
        <div className="govie-heading-l">Open Events</div>
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
