export const ListRow = ({
  item,
  change,
}: {
  item: { value: string | JSX.Element; key: string };
  change?: { value: string; key: string };
}) => (
  <div className="govie-summary-list__row">
    <dt className="govie-summary-list__key">{item.key}</dt>
    <dd className="govie-summary-list__value">{item.value}</dd>
    {change && (
      <dd className="govie-summary-list__actions">
        <a className="govie-link" href={change.value}>
          {change.key}
        </a>
      </dd>
    )}
  </div>
);
