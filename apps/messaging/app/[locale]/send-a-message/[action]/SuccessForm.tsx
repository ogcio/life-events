import { RedirectType, redirect } from "next/navigation";
import { MessageCreateProps } from "../../../utils/messaging";
import { api } from "messages";

export default (props: MessageCreateProps) => {
  async function action() {
    "use server";
    props.stateId &&
      (await api.deleteMessageState(props.userId, props.stateId));

    redirect("/send-a-message", RedirectType.replace);
  }
  return (
    <>
      <h1>All done</h1>
      <form action={action}>
        <button className="govie-button" type="submit">
          New message
        </button>
      </form>
    </>
  );
};
