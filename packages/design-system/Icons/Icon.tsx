import React from "react";
import "./icon.css";
type Props = {
  className?: string;
  color?: string;
  icon:
    | "events"
    | "about"
    | "birth"
    | "health"
    | "driving"
    | "employment"
    | "business"
    | "housing"
    | "death";
};

export default ({ className, color, icon }: Props) => {
  const iconClassName = `ds-icon-${icon}`;
  const _className = ["ds-icon", iconClassName, className || ""].join(" ");
  return <span className={_className} style={{ color }}></span>;
};
