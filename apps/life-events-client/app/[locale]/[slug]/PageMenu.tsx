import React, { PropsWithChildren, ReactElement } from "react";
import ds from "design-system";
import "./PageMenu.css";
import { Lang } from "../../../data/data";
import { translate } from "../../../utils/locale";
import { Icon } from "@govie-ds/react";

/**
 * Note on the Icon icon property
 *
 * They use an icon library but haven't added all icon names
 * as a valid icon property, even though they are just passing the
 * prop to the library as is.
 *
 *  Whenever this gets resolved, remove the "as any" values
 */

export function PageMenuItem(
  props: PropsWithChildren<{
    icon: string;
    isSelected: boolean;
    href: string;
  }>,
) {
  return (
    <li className={`${props.isSelected ? "selected-menu-item" : ""}`}>
      <Icon icon={props.icon as any} className="menu-icon" variant="outlined" />
      <a href={props.href}>{props.children}</a>
    </li>
  );
}

export default function PageMenu(props: {
  userName: string;
  topItems: ReactElement[];
  bottomItems: ReactElement[];
}) {
  return (
    <div className="main-content-page-menu">
      <div className="user-name">{props.userName}</div>
      <ol>{props.topItems}</ol>
      <hr />
      <ol>{props.bottomItems}</ol>
    </div>
  );
}
