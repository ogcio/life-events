import Link from "next/link";
export type Event = {
  href: string;
  linkLabel: string;
  description: string;
};

/**
 * None of these objects are "complete".
 *
 * The data will come from Info Mediator.
 *
 * Structure is unknown and highly subject to change.
 */
const mockEvents: Event[] = [
  {
    description: "Expires on 19th March - Apply now",
    href: "/driving/renew-license",
    linkLabel: "Renew your driving licence",
  },
  {
    description: "Rules to follow and what to register for",
    href: "start-business",
    linkLabel: "Start a business",
  },
  {
    description: "Sold, transferred or purchased a new cehicle?",
    href: "register-vehicle",
    linkLabel: "Register a motor vehicle",
  },
];
const mockOpenEvents: Event[] = [
  {
    description: "Get necessary state healthcare in all EU countries",
    href: "ehic-application",
    linkLabel: "Continue your EHIC application",
  },
  {
    description:
      "Book your official DVSA practical driving test for cars from €62",
    href: "driving-test-application",
    linkLabel: "Continue with your driving test application",
  },
];

export default () => (
  <div style={{ display: "flex", flexWrap: "wrap" }}>
    <section style={{ margin: "1rem 0", flex: 1, minWidth: "300px" }}>
      <h1 className="govie-heading-l">My Life Events</h1>
      <ul className="govie-list">
        {mockEvents.map((evt) => (
          <li
            key={`le_${evt.href}`}
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
    <section style={{ margin: "1rem 0", flex: 1, minWidth: "300px" }}>
      <h1 className="govie-heading-l">Open Events</h1>
      <ul className="govie-list">
        {mockOpenEvents.map((evt) => (
          <li
            key={`o_${evt.href}`}
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
  </div>
);
