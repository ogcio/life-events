"use client";
import { useFormState } from "react-dom";
import uploadFile from "../actions/uploadFile";
import { useTranslations } from "next-intl";

export default () => {
  const t = useTranslations();
  const [state, formAction] = useFormState(uploadFile, {});

  return (
    <form action={formAction}>
      <div className="govie-form-group govie-form-group--error">
        <label
          className="govie-label govie-label--s"
          htmlFor="example-file-upload"
        >
          {t("buttonLabel")}
        </label>
        {state.error && (
          <p id="example-file-upload-error" className="govie-error-message">
            <span className="govie-visually-hidden">Error:</span>{" "}
            {t("fileTooBig")}
          </p>
        )}
        <input
          className="govie-file-upload govie-input--error"
          id="example-file-upload"
          name="example-file-upload"
          type="file"
          aria-describedby="example-file-upload-error"
        />
        <button
          id="button"
          data-module="govie-button"
          className="govie-button  "
        >
          {t("uploadButton")}
        </button>
      </div>
    </form>
  );
};
