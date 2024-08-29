"use client";
import React, { useEffect } from "react";
import { useFormState } from "react-dom";

import ds from "design-system";
import { useTranslations } from "next-intl";

type SearchBarProps = {
  handleSearch: (
    fileId: string,
    formData: FormData,
  ) => Promise<{ error: string }>;
  searchString: string;
};

const initialState = { email: { value: "value", error: undefined } };

export default ({ handleSearch, searchString }: SearchBarProps) => {
  const [state, formAction] = useFormState(handleSearch, {
    email: { value: searchString, error: undefined },
  });

  const t = useTranslations("table");

  return (
    <form action={formAction}>
      <div
        className={`govie-form-group ${state?.email?.error ? "govie-form-group--error" : ""}`}
      >
        <div className="govie-input__wrapper">
          <input
            type="text"
            id="email"
            name="email"
            className="govie-input"
            autoComplete="off"
            autoFocus
            placeholder={t("searchUsersButton")}
            defaultValue={state?.email.value}
          />
          <button
            type="submit"
            aria-hidden="true"
            className="govie-input__suffix"
            style={{
              background: ds.colours.ogcio.gold,
              borderColor: ds.colours.ogcio.gold,
              cursor: "pointer",
            }}
          >
            <ds.Icon icon="search" color={ds.colours.ogcio.white} />
          </button>
        </div>
        {state?.email?.error && (
          <p id="file-upload-error" className="govie-error-message">
            <span className="govie-visually-hidden">Error:</span>
            {/* {errorT(state.error)} */}
            {state.email.error}
          </p>
        )}
      </div>
    </form>
  );
};
