import Link from "next/link";

export default () => (
  <>
    <div>
      <Link className="govie-link" href="settings/emails">
        Emails
      </Link>
    </div>
    <Link className="govie-back-link" href="/">
      Back
    </Link>
  </>
);
