import { GenericResponse } from "../routes/schemas";
import { getPaginationLinks, PaginationDetails } from "./pagination";

export const formatAPIResponse = <T>(
  data: T,
  pagination?: PaginationDetails,
): GenericResponse<T> => {
  const response: GenericResponse<T> = {
    data,
    metadata: {},
  };

  if (pagination) {
    response.metadata.links = getPaginationLinks(pagination);
  }

  return response;
};
