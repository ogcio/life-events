import React from "react";
import { data } from "../../../data/data";
import { translate } from "../../../utils/locale";
import "./MyDashboard.css";
import { Heading, Icon, Label, Link, Paragraph } from "@govie-ds/react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

// @ts-ignore
import placeholderVideoImage from "./video_placeholder.png";

export default async function MyDashboard(props: {
  userId: string;
  locale: string;
}) {
  const tDash = await getTranslations("Dashboard");
  const recentlySubmittedJourneys: Awaited<
    ReturnType<typeof data.subcategoryItem.submittedJourneys>
  > = [];
  const highlightedJourneys: Awaited<
    ReturnType<typeof data.subcategoryItem.highlightedJourneys>
  > = [];
  try {
    recentlySubmittedJourneys.push(
      ...(await data.subcategoryItem.submittedJourneys(props.userId)),
    );
  } catch (err) {}

  try {
    highlightedJourneys.push(
      ...(await data.subcategoryItem.highlightedJourneys(props.userId)),
    );
  } catch (err) {}

  return (
    <article className="my-dash-container">
      <section>
        <Heading>{tDash("newMessagesHeading")}</Heading>
        <Paragraph>{tDash("noNewMessages")}</Paragraph>
      </section>

      <section>
        <Heading>{tDash("highlightedHeading")}</Heading>
        {highlightedJourneys.map((journey) => (
          <React.Fragment key={`hgh_${journey.itemId}`}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "grid",
                }}
              >
                <Link href="#" noVisited>
                  <Label
                    text={translate(journey.copy, props.locale, "title")}
                  />
                </Link>

                <Paragraph
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginRight: "24px",
                  }}
                >
                  {translate(journey.copy, props.locale, "text")}
                </Paragraph>
              </div>
              <Icon icon={"chevron_right" as any} />
            </div>
            <hr
              className="govie-section-break govie-section-break--visible"
              style={{ marginBottom: "24px" }}
            ></hr>
          </React.Fragment>
        ))}
      </section>

      <section>
        <Heading>{tDash("welcomeHeading")}</Heading>
        <Image
          width={470}
          height={266}
          src={placeholderVideoImage}
          alt="Video player"
        />
        <Paragraph style={{ paddingTop: "24px" }}>
          {tDash("welcomeParagraph")}
        </Paragraph>
      </section>

      <section>
        <Heading>{tDash("recentHeading")}</Heading>
        <ol>
          {recentlySubmittedJourneys.map((journey) => (
            <React.Fragment key={`sbm_${journey.itemId}`}>
              <li>{translate(journey.title, props.locale)}</li>
              <hr className="govie-section-break govie-section-break--visible"></hr>
            </React.Fragment>
          ))}
        </ol>
      </section>
    </article>
  );
}
