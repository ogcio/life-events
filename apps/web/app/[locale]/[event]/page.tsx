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
import styles from "./page.module.scss";

const componentsMap = {
  [routes.events.slug]: MyLifeEvents,
  [routes.aboutMe.slug]: AboutMe,
  [routes.birth.slug]: Birth,
  [routes.health.slug]: Health,
  [routes.driving.slug]: Driving,
  [routes.employment.slug]: Employment,
  [routes.business.slug]: StartingABusiness,
  [routes.housing.slug]: Housing,
  [routes.death.slug]: Death,
};

export default async (props: web.NextPageProps) => {
  const Component = componentsMap[props.params.event];
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
        <main>
          <Component locale={locale} />
        </main>
      </div>
    );
  }
  throw notFound();
};
