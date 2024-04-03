import { mailApi } from "messages";
import { pgpool } from "messages/dbConnection";
import { revalidatePath } from "next/cache";
import Link from "next/link";

const EmailProviderTable = ({
  providers,
}: {
  providers: Awaited<ReturnType<typeof mailApi.providers>>;
}) => {
  async function deleteAction(formData: FormData) {
    "use server";
    const id = formData.get("id")?.toString();

    await pgpool.query(
      `
      DELETE FROM email_providers WHERE id = $1
    `,
      [id],
    );
    revalidatePath("/");
  }
  return (
    <table className="govie-table">
      <thead className="govie-table__head">
        <tr className="govie-table__row">
          <th scope="col" className="govie-table__header">
            Name
          </th>
          <th scope="col" className="govie-table__header">
            Host
          </th>
          <th scope="col" className="govie-table__header">
            Action
          </th>
        </tr>
      </thead>
      <tbody className="govie-table__body">
        {providers.map((provider) => (
          <tr className="govie-table__row">
            <th className="govie-table__header govie-table__header--vertical-centralized govie-body-s">
              {provider.name}
            </th>
            <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
              {provider.host}
            </td>
            <td className="govie-table__cell govie-table__cell--vertical-centralized govie-body-s">
              <div style={{ display: "flex", alignItems: "center" }}>
                <Link
                  className="govie-link govie-!-margin-right-3"
                  href={(() => {
                    const url = new URL(
                      `admin/settings/emails/provider`,
                      process.env.HOST_URL,
                    );
                    url.searchParams.append("id", provider.id);
                    return url.href;
                  })()}
                >
                  Edit
                </Link>
                <form
                  action={deleteAction}
                  className="govie-!-margin-right-3"
                  style={{ display: "inline-block" }}
                >
                  <input type="hidden" name="id" value={provider.id} />
                  <button
                    type="submit"
                    className="govie-button govie-button--small govie-button--outlined"
                    style={{ margin: "unset" }}
                  >
                    Delete
                  </button>
                </form>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default async (props: any) => {
  const emailProviders = await mailApi.providers();
  return (
    <div>
      <h1>Email settings</h1>
      <h3>
        <span className="govie-heading-m">Providers</span>
      </h3>

      <Link className="govie-link" href="emails/provider">
        Add provider
      </Link>

      <hr />
      <EmailProviderTable providers={emailProviders} />
    </div>
  );
};
