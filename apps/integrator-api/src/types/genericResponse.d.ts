import { PaginationLinks } from "./pagination";

export type GenericResponse<T> = {
  data: T;
  metadata?: {
    links?: PaginationLinks;
    totalCount?: number;
  };
};
