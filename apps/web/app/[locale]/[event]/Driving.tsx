import { getTranslations } from "next-intl/server";
import { routes, workflow } from "../../utils";
import EventsList from "./components/EventsList";
import styles from "./event.module.scss";

async function getEvents() {
  "use server";
  return Promise.resolve([
    {
      flowKey: workflow.keys.renewDriversLicence,
      category: workflow.categories.driving,
    },
    {
      flowKey: workflow.keys.replaceLostStolenLicence,
      category: workflow.categories.driving,
    },
    {
      flowKey: workflow.keys.drivingLicenceCategories,
      category: workflow.categories.driving,
    },
  ]);
}

export default async () => {
  const t = await getTranslations("Driving");

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
    <div className={styles.eventContainer}>
      <div className="govie-heading-l">{t("title")}</div>
      <div className={styles.sectionsWrapper}>
        <section className={styles.section}>
          <EventsList
            events={eventsToRender.slice(0, 2)}
            category={t("title")}
          />
        </section>
        <section className={styles.section}>
          <EventsList
            events={eventsToRender.slice(2, 4)}
            category={t("title")}
          />
        </section>
      </div>
    </div>
  );
};
