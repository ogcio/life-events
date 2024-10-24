import "./orgSelector.css";

export type OrganizationSelectorItem = {
  name: string;
  id: string;
};

export type OrganizationSelectorProps = {
  title?: string;
  description?: string;
  actionTitle: string;
  organizations: OrganizationSelectorItem[];
  defaultOrganization?: string;
  handleSubmit: any;
  disabled?: boolean;
};

export default function ({
  title,
  description,
  actionTitle,
  organizations,
  defaultOrganization,
  handleSubmit,
  disabled = false,
}: OrganizationSelectorProps) {
  if (organizations.length < 1) {
    return <></>;
  }

  return (
    <div>
      <form action={handleSubmit}>
        <div className="govie-form-group organization-selector-wrapper">
          {title && (
            <div>
              <label
                htmlFor="organization"
                className="govie-!-font-weight-regular govie-label--s govie-!-font-size-16 organization-selector-label"
              >
                {title}
              </label>
            </div>
          )}

          {description && (
            <div
              style={{
                marginBottom: "16px",
              }}
            >
              {description}
            </div>
          )}
          <select
            id="organization"
            name="organization"
            className="govie-select"
            defaultValue={defaultOrganization ?? organizations[0].id}
            disabled={disabled}
          >
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>

        <button
          id="button"
          type="submit"
          data-module="govie-button"
          className="govie-button govie-button--medium"
          disabled={disabled}
          style={{
            width: "100%",
          }}
        >
          {actionTitle}
        </button>
      </form>
    </div>
  );
}
