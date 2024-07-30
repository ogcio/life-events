import { notFound } from "next/navigation";

export default async () => {
  throw notFound();
};
