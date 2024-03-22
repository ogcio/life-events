"use client";

export default function CopyLink(props: { link: string; buttonText: string }) {
  function copyLink() {
    navigator.clipboard.writeText(props.link);
  }

  // Clipboard is only available over HTTPS
  // if (!navigator.clipboard) {
  //   return null;
  // }

  return (
    <button
      className="govie-button"
      style={{ margin: "32px 0 0" }}
      onClick={copyLink}
    >
      {props.buttonText}
    </button>
  );
}
