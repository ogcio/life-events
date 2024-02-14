import Link from "next/link";
import { routeDefinitions } from "../../routeDefinitions";
import { Event } from "./MyLifeEvents";

const mockEvents: Event[] = [
  {
    description: "Expires some time soon",
    href: routeDefinitions.driving.renewLicense.path(),
    linkLabel: "Renew your driving license",
  },
];

const mockOpenEvents: Event[] = [];

export default () => (
  <>
    <section style={{ margin: "1rem 0", flex: 1 }}>
      <h1 className="govie-heading-l">My Life Events</h1>
      <ul className="govie-list">
        {mockEvents.map((evt) => (
          <li
            style={{
              margin: "0 0 1rem 0",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-around",
              gap: "1rem",
            }}
          >
            <Link className="govie-link" href={evt.href}>
              {evt.linkLabel}
            </Link>
            <p className="govie-body" style={{ margin: "unset" }}>
              {evt.description}
            </p>
            <hr className="govie-section-break govie-section-break--visible" />
          </li>
        ))}
      </ul>
    </section>
    <section style={{ margin: "1rem 0", flex: 1 }}>
      <h1 className="govie-heading-l">Open Events</h1>
      <ul className="govie-list">
        {mockOpenEvents.map((evt) => (
          <li
            style={{
              margin: "0 0 3rem",
              display: "flex",
              justifyContent: "space-around",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            <div style={{ width: "75px", height: "75px" }}></div>
            <div style={{ flex: 1 }}>
              <Link className="govie-link" href={evt.href}>
                {evt.linkLabel}
              </Link>
              <p
                className="govie-body"
                style={{ margin: "unset", overflow: "auto" }}
              >
                {evt.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  </>
);
