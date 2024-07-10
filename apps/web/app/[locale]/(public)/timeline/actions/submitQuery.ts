"use server";

import { redirect } from "next/navigation";

const submitQuery = async (
  path: string,
  searchParams: URLSearchParams,
  formData: FormData,
) => {
  const searchQuery = formData.get("search-query")?.toString() || "";

  const newSearchParams = new URLSearchParams(searchParams);
  newSearchParams.set("searchQuery", searchQuery);

  redirect(`${path}?${newSearchParams.toString()}`);
};

export default submitQuery;
