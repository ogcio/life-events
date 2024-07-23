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
};

export default function ({
  title,
  actionTitle,
  organizations,
  defaultOrganization,
  handleSubmit,
}: OrganizationSelectorProps) {
  return (
    <div>
      <form action={handleSubmit}>
        <div className="govie-form-group" style={{ marginBottom: "12px;" }}>
          <label
            htmlFor="organization"
            className="govie-!-font-weight-regular govie-label--s govie-!-font-size-16"
            style={{
              lineHeight: "2 !important",
            }}
          >
            {title}
          </label>
          <br />
          <select
            id="organization"
            name="organization"
            className="govie-select"
            defaultValue={defaultOrganization ?? organizations[0].id}
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
          className="govie-button govie-button--small "
        >
          {actionTitle}
        </button>
      </form>
    </div>
  );
}
