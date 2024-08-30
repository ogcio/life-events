import { redirect, RedirectType } from "next/navigation";
import authenticatedAction from "../../../../../utils/authenticatedAction";

const EMAIL_REGEXP = /^[^<;%]*@[^<;]*$/;

const searchUser = async (fileId: string, prevState, formData) => {
  "use server";
  const email = formData.get("email");

  if (!EMAIL_REGEXP.test(email as string)) {
    return { email: { value: email, error: "Email invalid" } };
  }

  const searchParams = new URLSearchParams();
  searchParams.set("email", email as string);

  redirect(`/file/${fileId}?${searchParams.toString()}`, RedirectType.replace);
};

export default authenticatedAction(searchUser);
