export type PaginationDetails = {
  offset: number;
  limit: number;
  totalCount: number;
  url: string;
};

export const getPageFromOffset = (offset: number, limit: number): number => {
  return Math.floor(offset / limit + 1);
};

export const getPaginationLinks = (details: PaginationDetails) => {
  return {
    self: {
      href: `${details.url}?limit=${details.limit}&offset=${details.offset}`,
    },
    next: {
      href:
        details.offset + details.limit <= details.totalCount
          ? `${details.url}?limit=${details.limit}&offset=${details.offset + details.limit}`
          : undefined,
    },
    prev: {
      href:
        details.offset - details.limit >= 0
          ? `${details.url}?limit=${details.limit}&offset=${details.offset - details.limit}`
          : undefined,
    },
    first: {
      href: `${details.url}?limit=${details.limit}&offset=0`,
    },
    last: {
      href:
        details.totalCount > 0
          ? `${details.url}?limit=${details.limit}&offset=${Math.ceil(details.totalCount / details.limit) * details.limit - details.limit}`
          : `${details.url}?limit=${details.limit}&offset=0`,
    },
  };
};
