"use client";

import React from "react";
import send from "./events";

export default function TestButton() {
  return (
    <>
      <button
        onClick={() => {
          send("button", "click", "send event");
        }}
      >
        Send event
      </button>

      <button
        onClick={() => {
          send("button", "click", "send event with value (55)", 55);
        }}
      >
        Send event with value
      </button>

      <button
        onClick={() => {
          send("forms", "submit", undefined, undefined, {
            dimension1: "Agency A",
            dimension2: "Subagency B",
            dimension3: "Form C",
          });
        }}
      >
        Send event with custom dimensions (forms)
      </button>

      <button
        onClick={() => {
          const value = Math.floor(Math.random() * 100);

          send("payments", "submit", "Value", value, {
            dimension1: "Agency A",
            dimension2: "Subagency B",
            dimension4: "Payments provider X",
          });
        }}
      >
        Send event with custom dimensions (payments)
      </button>

      <button
        onClick={() => {
          const value = Math.floor(Math.random() * 100);

          send("payments", "submit", "Value", value, {
            dimension1: "Agency A",
            dimension2: "Subagency A",
            dimension4: "Payments provider Y",
          });
        }}
      >
        Send event with custom dimensions (payments) - Subagency A
      </button>
    </>
  );
}
