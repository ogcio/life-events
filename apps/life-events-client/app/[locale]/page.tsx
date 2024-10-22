import { redirect } from "next/navigation";

export default function RootLocalePage() {
  return redirect("/my-dashboard");
}
