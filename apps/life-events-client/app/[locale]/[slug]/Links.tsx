import React from "react";
import { data, Link } from "../../../data/data";
import { translate } from "../../../utils/locale";
import { Icon } from "@govie-ds/react";
import "./Links.css";

export function Links(props: {
  links: Link[];
  itemId: string;
  userId: string; // This shouldn't be here obviously
  locale: string;
}) {
  const render: React.ReactElement[] = [];
  const links = props.links.filter((link) => Boolean(link.href));
  let keyIndex = 0;
  let size = links.length - 1;
  let index = 0;

  async function simulateCompletedJourneyAction() {
    "use server";

    data.subcategoryItem.completeJourney(props.itemId, props.userId);
  }

  for (const link of links) {
    const url = new URL(
      "/skojaren",
      process.env.NEXT_PUBLIC_LEA_SERVICE_ENTRY_POINT,
    );
    url.searchParams.append("cb", link.href);
    url.searchParams.append("iid", props.itemId);
    render.push(
      <a
        key={`${props.itemId}_${++keyIndex}`}
        className={`govie-link govie-link--no-visited-state link-anchor ${link.isExternal ? "link-anchor__padded" : ""}`.trim()}
        href={url.href}
      >
        {translate(link.name, props.locale)}
        {link.isExternal && (
          <Icon size="sm" icon="open_in_new" inline className="link-icon" />
        )}
      </a>,
    );

    if (index < size) {
      render.push(
        <div key={`${props.itemId}_${++keyIndex}`} className="link-divider" />,
      );
    }
    index++;
  }

  return (
    <form action={simulateCompletedJourneyAction}>
      <div className="link-container">{render}</div>
      <input type="hidden" name="itemId" defaultValue={props.itemId} />
    </form>
  );
}
