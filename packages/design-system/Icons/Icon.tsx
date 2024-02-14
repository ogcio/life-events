import React from "react";
import "./icon.css";
type Props = {
  className?: string;
  color?: string;
  size?: number;
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
    | "logout";
};

export default ({ className, color, icon, size }: Props) => {
  const iconClassName = `ds-icon-${icon}`;
  const _className = ["ds-icon", iconClassName, className || ""].join(" ");
  const style: React.CSSProperties = { color };
  if (size) {
    style.height = `${size}px`;
    style.width = `${size}px`;
  }
  return <span className={_className} style={style}></span>;
};
