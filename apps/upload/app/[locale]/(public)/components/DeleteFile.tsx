"use client";
import { useFormState } from "react-dom";
import { useTranslations } from "next-intl";

type DeleteFileProps = {
  deleteFile: (formData: FormData) => Promise<{ error: string }>;
  id: string;
};

const initialState = {};

export default ({ deleteFile, id }: DeleteFileProps) => {
  const t = useTranslations();
  const tError = useTranslations("Errors");
  const [state, formAction] = useFormState(deleteFile, initialState);

  return (
    <form action={formAction} style={{ display: "inline" }}>
      <span data-module="govie-tooltip">
        <button data-module="govie-icon-button" className="govie-icon-button">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"
              fill="#505A5F"
            ></path>
          </svg>
          <span className="govie-visually-hidden">Close</span>
        </button>
        <input type="text" name="file-key" hidden defaultValue={id} />
        <span className="govie-tooltip govie-tooltip--top">Close</span>
        {state.error && (
          <p id="file-delete-error" className="govie-error-message">
            <span className="govie-visually-hidden">Error:</span>
            {tError(state.error)}
          </p>
        )}
      </span>
    </form>
  );
};
