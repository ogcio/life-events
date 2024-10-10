import { FastifyRequest } from "fastify";
import {
  GenericResponse,
  PaginationParams,
} from "../types/schemaDefinitions.js";

export type PaginationDetails = {
  offset?: number;
  limit?: number;
  url: URL;
};

export const PAGINATION_OFFSET_DEFAULT = 0;
export const PAGINATION_LIMIT_DEFAULT = 20;
export const PAGINATION_MAX_LIMIT = 100;
export const PAGINATION_MIN_LIMIT = 1;
export const PAGINATION_MIN_OFFSET = 0;

export const formatAPIResponse = <T>(params: {
  data: T[];
  pagination?: PaginationDetails;
  request?: FastifyRequest;
  totalCount: number;
}): GenericResponse<T[]> => {
  const response: GenericResponse<T[]> = {
    data: params.data,
  };

  if (params.pagination) {
    response.metadata = {
      links: getPaginationLinks(params.pagination, params.totalCount),
      totalCount: params.totalCount,
    };

    return response;
  }
  if (params.request) {
    const paginationDetails = getUrlDataForPagination(params.request);
    response.metadata = {
      links: getPaginationLinks(paginationDetails, params.totalCount),
      totalCount: params.totalCount,
    };

    return response;
  }

  return response;
};

export const getPaginationLinks = (
  inputDetails: PaginationDetails,
  totalCount: number,
) => {
  const details: Required<PaginationDetails> = {
    ...inputDetails,
    limit: inputDetails.limit ?? PAGINATION_LIMIT_DEFAULT,
    offset: inputDetails.offset ?? PAGINATION_OFFSET_DEFAULT,
  };

  return {
    self: {
      href: (() => {
        const link = new URL(details.url);
        link.searchParams.append("limit", details.limit.toString());
        link.searchParams.append("offset", details.offset.toString());
        return link.href;
      })(),
    },
    next: {
      href:
        details.offset + details.limit < totalCount
          ? (() => {
              const link = new URL(details.url);
              link.searchParams.append("limit", details.limit.toString());
              link.searchParams.append(
                "offset",
                (details.offset + details.limit).toString(),
              );
              return link.href;
            })()
          : undefined,
    },
    prev: {
      href:
        details.offset - details.limit >= 0
          ? (() => {
              const link = new URL(details.url);
              link.searchParams.append("limit", details.limit.toString());
              link.searchParams.append(
                "offset",
                (details.offset - details.limit).toString(),
              );
              return link.href;
            })()
          : undefined,
    },
    first: {
      href: (() => {
        const link = new URL(details.url);
        link.searchParams.append("limit", details.limit.toString());
        link.searchParams.append("offset", "0");
        return link.href;
      })(),
    },
    last: {
      href:
        totalCount > 0
          ? (() => {
              const link = new URL(details.url);
              link.searchParams.append("limit", details.limit.toString());
              link.searchParams.append(
                "offset",
                (
                  Math.ceil(totalCount / details.limit) * details.limit -
                  details.limit
                ).toString(),
              );
              return link.href;
            })()
          : (() => {
              const link = new URL(details.url);
              link.searchParams.append("limit", details.limit.toString());
              link.searchParams.append("offset", "0");
              return link.href;
            })(),
    },
    pages: generatePageLinks(details, totalCount),
  };
};

const generatePageLinks = (
  details: Required<PaginationDetails>,
  totalCount: number,
) => {
  const pageLinks: Record<string, { href: string }> = {};
  const nrOfBatches = Math.ceil(totalCount / details.limit);

  if (nrOfBatches <= 1) {
    return pageLinks;
  }

  if (nrOfBatches <= 5) {
    for (
      let i = 0, calculatedOffset = 0;
      i < nrOfBatches;
      i++, calculatedOffset += details.limit
    ) {
      pageLinks[i + 1] = {
        href: `${details.url}?limit=${details.limit}&offset=${calculatedOffset}`,
      };
    }

    return pageLinks;
  }

  pageLinks[1] = {
    href: (() => {
      const link = new URL(details.url);
      link.searchParams.append("limit", details.limit.toString());
      link.searchParams.append("offset", "0");
      return link.href;
    })(),
  };
  pageLinks[nrOfBatches] = {
    href: (() => {
      const link = new URL(details.url);
      link.searchParams.append("limit", details.limit.toString());
      link.searchParams.append(
        "offset",
        ((nrOfBatches - 1) * details.limit).toString(),
      );
      return link.href;
    })(),
  };

  const currentBatch = Math.floor(details.offset / details.limit) + 1;

  if (currentBatch === 1) {
    pageLinks[2] = {
      href: (() => {
        const link = new URL(details.url);
        link.searchParams.append("limit", details.limit.toString());
        link.searchParams.append("offset", (1 * details.limit).toString());
        return link.href;
      })(),
    };
    pageLinks[3] = {
      href: (() => {
        const link = new URL(details.url);
        link.searchParams.append("limit", details.limit.toString());
        link.searchParams.append("offset", (3 * details.limit).toString());
        return link.href;
      })(),
    };
  } else if (currentBatch === nrOfBatches) {
    pageLinks[nrOfBatches - 2] = {
      href: (() => {
        const link = new URL(details.url);
        link.searchParams.append("limit", details.limit.toString());
        link.searchParams.append(
          "offset",
          ((nrOfBatches - 3) * details.limit).toString(),
        );
        return link.href;
      })(),
    };
    pageLinks[nrOfBatches - 1] = {
      href: (() => {
        const link = new URL(details.url);
        link.searchParams.append("limit", details.limit.toString());
        link.searchParams.append(
          "offset",
          ((nrOfBatches - 2) * details.limit).toString(),
        );
        return link.href;
      })(),
    };
  } else {
    pageLinks[currentBatch - 1] = {
      href: (() => {
        const link = new URL(details.url);
        link.searchParams.append("limit", details.limit.toString());
        link.searchParams.append(
          "offset",
          ((currentBatch - 2) * details.limit).toString(),
        );
        return link.href;
      })(),
    };
    pageLinks[currentBatch] = {
      href: (() => {
        const link = new URL(details.url);
        link.searchParams.append("limit", details.limit.toString());
        link.searchParams.append(
          "offset",
          ((currentBatch - 1) * details.limit).toString(),
        );
        return link.href;
      })(),
    };
    pageLinks[currentBatch + 1] = {
      href: (() => {
        const link = new URL(details.url);
        link.searchParams.append("limit", details.limit.toString());
        link.searchParams.append(
          "offset",
          (currentBatch * details.limit).toString(),
        );
        return link.href;
      })(),
    };
  }

  return pageLinks;
};

export const sanitizePagination = (
  pagination: PaginationParams,
): Required<PaginationParams> => {
  return {
    limit: Math.max(
      Math.min(
        PAGINATION_MAX_LIMIT,
        Number(pagination.limit) ?? PAGINATION_LIMIT_DEFAULT,
      ),
      PAGINATION_MIN_LIMIT,
    ).toString(),

    offset: Math.max(
      Number(pagination.offset) ?? PAGINATION_OFFSET_DEFAULT,
      PAGINATION_MIN_OFFSET,
    ).toString(),
  };
};

const getUrlDataForPagination = (
  request: FastifyRequest,
): PaginationDetails => {
  const originalUrl = new URL(request.originalUrl, process.env.HOST_URL);
  let limit,
    offset = undefined;
  if (originalUrl.searchParams.has("limit")) {
    const tempLimit = originalUrl.searchParams.get("limit");
    limit = tempLimit ?? undefined;
    originalUrl.searchParams.delete("limit");
  }
  if (originalUrl.searchParams.has("offset")) {
    const tempOffset = originalUrl.searchParams.get("offset");
    offset = tempOffset ?? undefined;
    originalUrl.searchParams.delete("offset");
  }

  return {
    url: originalUrl,
    limit: limit ? Number(limit) : undefined,
    offset: offset ? Number(offset) : undefined,
  };
};
