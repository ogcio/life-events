"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function CopyLink(props: {
  link: string;
  buttonText: string;
  linkStyle?: boolean;
}) {
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
    <>
      {props.linkStyle ? (
        <Link href="#" onClick={copyLink}>
          {props.buttonText}
        </Link>
      ) : (
        <button
          className={`govie-button govie-button--secondary`}
          onClick={copyLink}
          style={{
            minWidth: "110px",
          }}
        >
          {props.buttonText}
        </button>
      )}
    </>
  );
}
