"use client";

export default ({
  name,
  label,
  hint,
  defaultValue,
  error,
  autoComplete = "on",
}: {
  name: string;
  label: string;
  hint?: string;
  defaultValue?: string;
  error?: string;
  autoComplete?: "off" | "on";
}) => {
  return (
    <div className={`govie-form-group ${error && "govie-form-group--error"}`}>
      <label className="govie-label--s" htmlFor={name}>
        {label}
      </label>
      {hint && <div className="govie-hint">{hint}</div>}
      {error && (
        <p id="input-field-error" className="govie-error-message">
          <span className="govie-visually-hidden">Error:</span>
          {error}
        </p>
      )}
      <input
        type="text"
        id={name}
        name={name}
        className="govie-input"
        defaultValue={defaultValue}
        autoComplete={autoComplete}
      />
    </div>
  );
};
