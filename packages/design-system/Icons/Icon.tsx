import React from "react";
import "./icon.css";
type Props = {
  className?: string;
  color?: string;
  size?: number;
  width?: number;
  heigth?: number;
  icon:
    | "events"
    | "about"
    | "birth"
    | "health"
    | "driving"
    | "employment"
    | "business"
    | "housing"
    | "death"
    | "payments"
    | "providers"
    | "logout"
    | "notification"
    | "search"
    | "hamburger-menu"
    | "tiles"
    | "messaging-service"
    | "payments-service"
    | "send-a-message"
    | "template"
    | "settings";
};

export default ({ className, color, icon, size, heigth, width }: Props) => {
  const iconClassName = `ds-icon-${icon}`;
  const _className = ["ds-icon", iconClassName, className || ""].join(" ");
  const style: React.CSSProperties = { color };
  if (size) {
    style.height = `${size}px`;
    style.width = `${size}px`;
  }

  if (heigth && width) {
    style.height = `${heigth}px`;
    style.width = `${width}px`;
  }

  return <span className={_className} style={style}></span>;
};
