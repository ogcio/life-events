export const FormElement = ({
  children,
  error,
  label,
  id,
  hint,
}: React.PropsWithChildren<{
  error?: string;
  label: string;
  id: string;
  hint?: string;
}>) => {
  return (
    <div
      className={
        !Boolean(error)
          ? "govie-form-group"
          : "govie-form-group govie-form-group--error"
      }
    >
      {error && (
        <p id="input-field-error" className="govie-error-message">
          <span className="govie-visually-hidden">Error:</span>
          {error}
        </p>
      )}
      <label htmlFor={id} className="govie-label--s">
        {label}
      </label>
      {hint && (
        <div className="govie-hint" id="input-field-hint">
          {hint}
        </div>
      )}
      {children}
    </div>
  );
};
