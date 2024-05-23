"use client";

export default ({
  name,
  label,
  hint,
  defaultValue,
  error,
  prefix,
  autoComplete = "on",
  required = false,
  type = "text",
  min,
  max,
  step,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultValue?: string;
  error?: string;
  autoComplete?: "off" | "on";
  prefix?: string;
  required?: boolean;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
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
      <div className="govie-input__wrapper">
        {prefix && (
          <div aria-hidden="true" className="govie-input__prefix">
            {prefix}
          </div>
        )}
        <input
          type={type}
          id={name}
          name={name}
          className="govie-input"
          defaultValue={defaultValue}
          autoComplete={autoComplete}
          // required={required}
          min={min}
          max={max}
          step={step}
        />
      </div>
    </div>
  );
};
