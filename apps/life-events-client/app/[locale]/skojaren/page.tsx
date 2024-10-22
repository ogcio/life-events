import { redirect, RedirectType } from "next/navigation";
import React from "react";
import { AuthenticationFactory } from "../../../utils/authentication-factory";
import { data } from "../../../data/data";

export default async function Skojaren(props: {
  searchParams: { cb: string; iid: string };
}) {
  const { id } = await AuthenticationFactory.getInstance().getUser();

  try {
    data.subcategoryItem.completeJourney(props.searchParams.iid, id);
  } catch (err) {
    console.log(err);
  }
  redirect("/", RedirectType.replace);
}
