import React from "react";
import ds from "design-system";
import "./PageMenu.css";
import { Lang } from "../../../data/data";
import { translate } from "../../../utils/locale";
import { Icon } from "@govie-ds/react";

export default function PageMenu(props: {
  userName: string;
  selectedSlug: string;
  locale: string;
  categoryItems: {
    id: string;
    name: Lang<string>;
    slug: Lang<string>;
    icon: string;
  }[];
}) {
  console.log(ds.hexToRgba(ds.colours.ogcio.gold, 15));
  console.log(ds.hexToRgba(ds.colours.ogcio.gold, 5));
  return (
    <div className="main-content-page-menu">
      <div className="user-name">{props.userName}</div>
      <ol>
        <li
          className={`${"my-dashboard" === props.selectedSlug ? "selected-menu-item" : ""}`}
        >
          <ds.Icon icon="events" color={ds.colours.ogcio.green} />
          <a href="/">My dashboard</a>
        </li>
        <li
          className={`${"messaging" === props.selectedSlug ? "selected-menu-item" : ""}`}
        >
          <ds.Icon icon="send-a-message" color={ds.colours.ogcio.green} />
          <a href="/">Messaging</a>
        </li>
        <li
          className={`${"about-me" === props.selectedSlug ? "selected-menu-item" : ""}`}
        >
          <ds.Icon icon="events" color={ds.colours.ogcio.green} />
          <a href="/">About me</a>
        </li>
      </ol>
      <hr />
      <ol>
        {props.categoryItems.map((cat) => (
          <li
            key={cat.id}
            className={`${cat.slug.en === props.selectedSlug ? "selected-menu-item" : ""}`}
          >
            <ds.Icon
              icon={cat.icon as React.ComponentProps<typeof ds.Icon>["icon"]}
              color={ds.colours.ogcio.green}
            />
            <a href={`/${props.locale}/${cat.slug.en}`}>
              {translate(cat.name, props.locale)}
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
