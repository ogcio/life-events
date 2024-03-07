"use client";

export default function ClientLink(props: { label: string; href: string }) {
  return (
    <button
      className="govie-button govie-button--primary"
      onClick={(e) => {
        e.preventDefault()
        window.parent.location.href = props.href
      }}
    >{props.label}</button>
  )
}
