"use client";

import React, { useEffect, useState } from "react";
import styles from "../PaymentRequests.module.scss";

export default function CopyLink(props: { link: string; buttonText: string }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  function copyLink() {
    if (isClient && navigator.clipboard) {
      navigator.clipboard.writeText(props.link);
    }
  }

  if (!isClient) return;

  return (
    <button
      className={`govie-button govie-button--secondary ${styles.copyButton}`}
      onClick={copyLink}
    >
      {props.buttonText}
    </button>
  );
}
