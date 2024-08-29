"use server";
import { redirect, RedirectType } from "next/navigation";

const EMAIL_REGEXP = /^[^<;%]*@[^<;]*$/;

export default async (fileId: string, prevState, formData) => {
  const email = formData.get("email");

  if (!EMAIL_REGEXP.test(email as string)) {
    return { email: { value: email, error: "Email invalid" } };
  }

  const searchParams = new URLSearchParams();
  searchParams.set("email", email as string);

  redirect(`/file/${fileId}?${searchParams.toString()}`, RedirectType.replace);
};
