import { NextResponse } from "next/server";
import { data } from "../../../data/data";
import { AuthenticationFactory } from "../../../utils/authentication-factory";

export async function GET(req) {
  const { id } = await AuthenticationFactory.getInstance().getUser();
  const itemId = req.nextUrl.searchParams.get("iid");
  await data.subcategoryItem.completeJourney(itemId, id);
  return NextResponse.redirect(req.nextUrl.searchParams.get("cb"), {
    status: 307,
  });
}
