import { getTranslations } from "next-intl/server";
import Link from "next/link";
import styles from "./EventsList.module.scss";

const EventLink = ({
  children,
  slug,
  ariaLabel,
}: {
  children: React.ReactNode;
  slug?: string;
  ariaLabel?: string;
}) => {
  return slug ? (
    <Link className="govie-link" href={slug} aria-label={ariaLabel}>
      {children}
    </Link>
  ) : (
    <span
      className="govie-link"
      style={{
        pointerEvents: "none",
        color: "#003078" /* govie dark blue colour */,
      }}
    >
      {children}
    </span>
  );
};

export default async (props: {
  events: {
    flowKey: string;
    flowTitle: string;
    descriptionKey: string;
    slug: string;
  }[];
  category: string;
}) => {
  const t = await getTranslations(props.category);

  return (
    <ul className="govie-list">
      {props.events.slice(0, 2).map((evt) => (
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
              <EventLink slug={evt.slug}>
                <span>{t(evt.flowTitle)}</span>
              </EventLink>
              <p
                className="govie-body"
                style={{ margin: "unset", marginTop: "16px" }}
              >
                {t(evt.descriptionKey, { date: "19th March" })}
              </p>
            </div>
            <div className={styles.chevronIcon}>
              <EventLink slug={evt.slug} ariaLabel={t(evt.flowTitle)}>
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
              </EventLink>
            </div>
          </div>
          <hr className="govie-section-break govie-section-break--visible" />
        </li>
      ))}
    </ul>
  );
};
