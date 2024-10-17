import { GenericResponse } from "../types/genericResponse";
import { getPaginationLinks, PaginationDetails } from "./pagination";

export const formatAPIResponse = <T>(
  data: T,
  pagination?: PaginationDetails,
): GenericResponse<T> => {
  const response: GenericResponse<T> = {
    data,
  };

  if (pagination) {
    response.metadata = {
      links: getPaginationLinks(pagination),
      totalCount: pagination.totalCount,
    };
  }

  return response;
};
