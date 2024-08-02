import { AuthenticationFactory } from "./authentication-factory";

// this is a higher order function that takes a next server action and returns a new action that first checks if the user is authenticated
export default (action: (...props) => Promise<any>) =>
  async (...props) => {
    "use server";
    await AuthenticationFactory.getInstance().getContext();
    return action(...props);
  };
