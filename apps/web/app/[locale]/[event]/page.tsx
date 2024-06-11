export const dynamic = "force-dynamic";
export const revalidate = 0;
import MyLifeEvents from "./MyLifeEvents";
import AboutMe from "./AboutMe";

import { routes, web } from "../../utils";
import { notFound } from "next/navigation";
import Birth from "./Birth";
import Health from "./Health";
import Driving from "./Driving";
import Employment from "./Employment";
import StartingABusiness from "./StartingABusiness";
import Housing from "./Housing";
import Death from "./Death";
import SideMenu from "./components/SideMenu";
import { getMessages } from "next-intl/server";
import { AbstractIntlMessages } from "next-intl";
import { isFeatureFlagEnabled } from "feature-flags/utils";
import styles from "./page.module.scss";

const componentsMap = async () => ({
  [routes.events.slug]: (await isFeatureFlagEnabled("events")) && MyLifeEvents,
  [routes.aboutMe.slug]: (await isFeatureFlagEnabled("aboutMe")) && AboutMe,
  [routes.birth.slug]: (await isFeatureFlagEnabled("birth")) && Birth,
  [routes.health.slug]: (await isFeatureFlagEnabled("health")) && Health,
  [routes.driving.slug]: (await isFeatureFlagEnabled("driving")) && Driving,
  [routes.employment.slug]:
    (await isFeatureFlagEnabled("employment")) && Employment,
  [routes.business.slug]:
    (await isFeatureFlagEnabled("business")) && StartingABusiness,
  [routes.housing.slug]: (await isFeatureFlagEnabled("housing")) && Housing,
  [routes.death.slug]: (await isFeatureFlagEnabled("death")) && Death,
});

export default async (props: web.NextPageProps) => {
  const Component = (await componentsMap())[props.params.event];
  const messages = await getMessages({ locale: props.params.locale });
  const timelineMessages = messages.Timeline as AbstractIntlMessages;
  const locale = props.params.locale;

  if (Component) {
    return (
      <div className={styles.eventsPageWrapper}>
        <aside>
          <SideMenu
            searchParams={props.searchParams}
            messages={timelineMessages}
            locale={locale}
          />
        </aside>
        <main style={{ flex: 1 }}>
          <Component locale={locale} />
        </main>
      </div>
    );
  }
  throw notFound();
};
