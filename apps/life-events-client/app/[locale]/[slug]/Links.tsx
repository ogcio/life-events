import React from "react";
import { Link } from "../../../data/data";
import { translate } from "../../../utils/locale";
import { Icon } from "@govie-ds/react";
import "./Links.css";

export function Links(props: { links: Link[]; keyId: string; locale: string }) {
  const render: React.ReactElement[] = [];
  const links = props.links.filter((link) => Boolean(link.href));
  let keyIndex = 0;
  let size = links.length - 1;
  let index = 0;

  for (const link of links) {
    render.push(
      <a
        className={`govie-link govie-link--no-visited-state link-anchor ${link.isExternal ? "link-anchor__padded" : ""}`.trim()}
        href={link.href}
      >
        {translate(link.name, props.locale)}
        {link.isExternal && (
          <Icon size="sm" icon="open_in_new" inline className="link-icon" />
        )}
      </a>,
    );

    if (index < size) {
      render.push(
        <div key={`${props.keyId}_${++keyIndex}`} className="link-divider" />,
      );
    }
    index++;
  }

  return <div className="link-container">{render}</div>;
}
