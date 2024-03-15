import { RedirectType, redirect } from "next/navigation";

export default () => {
  return redirect("/admin/submissions", RedirectType.replace);
};
