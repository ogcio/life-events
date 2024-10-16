import React from "react";
import ds from "design-system";
import { redirect } from "next/navigation";
import "./Search.css";
import { headers } from "next/headers";

export default function Search(props: {
  placeholder: string;
  default: string;
}) {
  async function searchAction(formData: FormData) {
    "use server";
    const search = formData.get("search")?.toString();

    const currentUrl = new URL(
      headers().get("x-pathname") || "",
      process.env.NEXT_PUBLIC_LEA_SERVICE_ENTRY_POINT!,
    );

    if (!search) {
      currentUrl.searchParams.delete("search");
    } else {
      currentUrl.searchParams.set("search", search);
    }

    redirect(currentUrl.href);
  }

  return (
    <form action={searchAction} className="search-form">
      <div className="govie-form-group">
        <div className="govie-input__wrapper">
          <input
            type="text"
            id="search"
            name="search"
            className="govie-input"
            autoComplete="off"
            defaultValue={props.default || ""}
            autoFocus
            placeholder={props.placeholder}
          />
          <button
            aria-hidden="true"
            className="govie-input__suffix"
            style={{
              background: ds.colours.ogcio.gold,
              borderColor: ds.colours.ogcio.gold,
            }}
          >
            <ds.Icon icon="search" color={ds.colours.ogcio.white} />
          </button>
        </div>
      </div>
    </form>
  );
}
