import "./orgSelector.css";

export type OrganizationSelectorItem = {
  name: string;
  id: string;
};

export type OrganizationSelectorProps = {
  title: string;
  actionTitle: string;
  organizations: OrganizationSelectorItem[];
  defaultOrganization?: string;
  handleSubmit: any;
  disabled?: boolean;
};

export default function ({
  title,
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
          <label
            htmlFor="organization"
            className="govie-!-font-weight-regular govie-label--s govie-!-font-size-16 organization-selector-label"
          >
            {title}
          </label>
          <br />
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
          className="govie-button govie-button--small"
          disabled={disabled}
        >
          {actionTitle}
        </button>
      </form>
    </div>
  );
}
