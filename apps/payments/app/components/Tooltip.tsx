"use client";

import { useState, useRef } from "react";

export default function Tooltip({ children, text, position = "top", width }) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef(null);

  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);

  const getTooltipStyle = () => {
    switch (position) {
      case "bottom":
        return {
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          marginTop: "8px",
        };
      case "left":
        return {
          right: "100%",
          top: "50%",
          transform: "translateY(-50%)",
          marginRight: "8px",
        };
      case "right":
        return {
          left: "100%",
          top: "50%",
          transform: "translateY(-50%)",
          marginLeft: "8px",
        };
      case "top":
      default:
        return {
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          marginBottom: "8px",
        };
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {isVisible && (
        <div
          ref={tooltipRef}
          style={{
            position: "absolute",
            padding: "5px",
            backgroundColor: "black",
            borderRadius: "4px",
            textAlign: "center",
            zIndex: 1000,
            color: "white",
            ...getTooltipStyle(),
            width,
          }}
        >
          <p className="govie-body" style={{ color: "white" }}>
            {text}
          </p>
        </div>
      )}
      <div
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        tabIndex={0}
      >
        {children}
      </div>
    </div>
  );
}
