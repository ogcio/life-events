import { PgSessions } from "auth/sessions";
import { AuthenticationFactory } from "./authentication-factory";

// this is a higher order function that takes a next server action and returns a new action that first checks if the user is authenticated
export default (action: (props: FormData) => Promise<void>) =>
  async (props: FormData) => {
    "use server";

    const authFactory = AuthenticationFactory.getInstance();
    await authFactory.getContext();

    return action(props);
  };
