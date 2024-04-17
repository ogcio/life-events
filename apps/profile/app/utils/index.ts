import dayjs from "dayjs";

export * as postgres from "./postgres";
export * as form from "./form";
export * as routes from "./routes";

export function formatDate(date: string | Date) {
  return dayjs(date).format("DD/MM/YYYY");
}
