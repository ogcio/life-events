import { getTranslations } from "next-intl/server";
import { routes, workflow } from "../../utils";
import EventsList from "./components/EventsList";

async function getEvents() {
  "use server";
  return Promise.resolve([
    {
      flowKey: workflow.keys.notifyChangeAddress,
      category: workflow.categories.housing,
    },
    {
      flowKey: workflow.keys.housingBenefit,
      category: workflow.categories.housing,
    },
    {
      flowKey: workflow.keys.housingAssociationHomes,
      category: workflow.categories.housing,
    },
    {
      flowKey: workflow.keys.housingOmbudsman,
      category: workflow.categories.housing,
    },
  ]);
}

export default async () => {
  const t = await getTranslations("Housing");

  const events = await getEvents();

  const eventsToRender = events.map((event) => {
    const flowTitle = event.flowKey + ".title";
    const descriptionKey = event.flowKey + ".description";
    return {
      flowTitle,
      flowKey: event.flowKey,
      descriptionKey,
      slug: routes.category[event.category][event.flowKey]?.path(),
    };
  });

  return (
    <div style={{ flex: 1, marginTop: "1rem" }}>
      <div className="govie-heading-l">{t("title")}</div>
      <div
        style={{ display: "flex", flexWrap: "wrap", flex: 1, gap: "2.5rem" }}
      >
        <section style={{ marginBottom: "1rem", flex: 1, minWidth: "400px" }}>
          <EventsList
            events={eventsToRender.slice(0, 2)}
            category={t("title")}
          />
        </section>
        <section style={{ marginBottom: "1rem", flex: 1, minWidth: "400px" }}>
          <EventsList
            events={eventsToRender.slice(2, 4)}
            category={t("title")}
          />
        </section>
      </div>
    </div>
  );
};
