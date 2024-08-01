"use client";
import { useFormState } from "react-dom";
import { useTranslations } from "next-intl";

type FileUploadProps = {
  uploadFile: (formData: FormData) => Promise<{ error: string }>;
};

const initialState = {};

export default ({ uploadFile }: FileUploadProps) => {
  const t = useTranslations();
  const [state, formAction] = useFormState(uploadFile, initialState);

  return (
    <form action={formAction}>
      <div
        className={`govie-form-group ${state.error && "govie-form-group--error"}`}
      >
        <label className="govie-label govie-label--s" htmlFor="file-upload">
          {t("buttonLabel")}
        </label>
        {state.error && (
          <p id="file-upload-error" className="govie-error-message">
            <span className="govie-visually-hidden">Error:</span>
            {t(state.error)}
          </p>
        )}
        <input
          className="govie-file-upload govie-input--error"
          id="file-upload"
          name="file-upload"
          type="file"
          aria-describedby="file-upload-error"
        />
        <button id="button" data-module="govie-button" className="govie-button">
          {t("uploadButton")}
        </button>
      </div>
    </form>
  );
};
