import { mailApi } from "messages";
import { pgpool } from "messages/dbConnection";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async (props: { searchParams: { id: string } }) => {
  console.log({ props, id: props.searchParams.id });
  async function submitAction(formData: FormData) {
    "use server";

    const name = formData.get("name")?.toString();
    const host = formData.get("host")?.toString();
    const username = formData.get("username")?.toString();
    const password = formData.get("password")?.toString();

    const id = formData.get("id")?.toString();

    if (!name || !host || !username || !password) {
      return;
    }

    if (!id) {
      await mailApi.createProvider(name, host, username, password);
    } else {
      await mailApi.updateProvider({
        host,
        id,
        name,
        password,
        username,
      });
    }
    redirect(new URL("admin/settings/emails", process.env.HOST_URL).href);
  }

  const data = props.searchParams.id
    ? await mailApi.provider(props.searchParams.id)
    : undefined;
  console.log(data);
  return (
    <>
      <h1>Add provider</h1>
      <form action={submitAction}>
        <input name="id" value={props.searchParams.id} type="hidden" />
        <div className="govie-form-group">
          <label htmlFor="host" className="govie-label--s">
            Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            className="govie-input"
            defaultValue={data?.name}
          />
        </div>

        <div className="govie-form-group">
          <label htmlFor="host" className="govie-label--s">
            Host
          </label>
          <input
            id="host"
            type="text"
            name="host"
            className="govie-input"
            defaultValue={data?.host}
          />
        </div>

        <div className="govie-form-group">
          <label htmlFor="host" className="govie-label--s">
            Username
          </label>
          <input
            id="username"
            type="text"
            name="username"
            className="govie-input"
            defaultValue={data?.username}
          />
        </div>

        <div className="govie-form-group">
          <label htmlFor="host" className="govie-label--s">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="text"
            className="govie-input"
            defaultValue={data?.password}
          />
        </div>
        <button className="govie-button" type="submit">
          {props.searchParams.id ? "Update" : "Create"}
        </button>
      </form>
      <Link className="govie-back-link" href={"./"}>
        Back
      </Link>
    </>
  );
};
