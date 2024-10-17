"use client";
import { useFormState } from "react-dom";
import { useTranslations } from "next-intl";

type FileUploadProps = {
  uploadFile: (formData: FormData) => Promise<{ error: string }>;
};

const initialState = {};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
  return formattedDate;
};

export default ({ uploadFile }: FileUploadProps) => {
  const t = useTranslations();
  const errorT = useTranslations("Errors");
  const [state, formAction] = useFormState(uploadFile, initialState);

  const oneHourFromNow = new Date();
  oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);

  const minValueAsString = formatDate(oneHourFromNow);

  return (
    <form
      style={{ display: "flex", flexDirection: "column" }}
      action={formAction}
    >
      <div
        className={`govie-form-group ${state.error ? "govie-form-group--error" : ""}`}
      >
        <label className="govie-label govie-label--s" htmlFor="file-upload">
          {t("buttonLabel")}
        </label>
        {state.error && (
          <p id="file-upload-error" className="govie-error-message">
            <span className="govie-visually-hidden">Error:</span>
            {errorT(state.error)}
          </p>
        )}
        <input
          className="govie-file-upload govie-input--error"
          id="file-upload"
          name="file-upload"
          type="file"
          aria-describedby="file-upload-error"
        />
      </div>
      <div
        className={`govie-form-group ${state.error ? "govie-form-group--error" : ""}`}
      >
        <label className="govie-label govie-label--s" htmlFor="expire-date">
          {t("dateLabel")}
        </label>

        <input
          type="datetime-local"
          id="expire-date"
          name="expire-date"
          className="govie-input"
          style={{ maxWidth: "50%" }}
          min={minValueAsString}
        />
      </div>
      <div>
        <button id="button" data-module="govie-button" className="govie-button">
          {t("uploadButton")}
        </button>
      </div>
    </form>
  );
};
