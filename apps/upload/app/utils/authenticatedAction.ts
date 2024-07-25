import { PgSessions } from "auth/sessions";

// this is a higher order function that takes a next server action and returns a new action that first checks if the user is authenticated
export default (action: (props: FormData) => Promise<void>) =>
  async (props: FormData) => {
    "use server";
    await PgSessions.get("get-digital-wallet");
    return action(props);
  };
