import { RedirectType, redirect } from "next/navigation";

export default () => redirect("send-a-message/meta", RedirectType.replace);
