import Link from "next/link";

export default ({ children }: React.PropsWithChildren) => {
  return (
    <>
      <div>{children}</div>
      <Link
        className="govie-back-link"
        href={new URL("/messages", process.env.HOST_URL).href}
      >
        Back
      </Link>
    </>
  );
};
