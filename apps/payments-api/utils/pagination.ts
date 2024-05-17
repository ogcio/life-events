export type PaginationDetails = {
  offset: number;
  limit: number;
  totalCount: number;
  url: string;
};

export const PAGINATION_OFFSET_DEFAULT = 0;
export const PAGINATION_LIMIT_DEFAULT = 10;

export const getPageFromOffset = (offset: number, limit: number): number => {
  return Math.floor(offset / limit + 1);
};

export const getPaginationLinks = (details: PaginationDetails) => {
  const pageLinks: Record<string, { href: string }> = {};
  const nrOfBatches = Math.ceil(details.totalCount / details.limit);

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
  } else {
    pageLinks[1] = {
      href: `${details.url}?limit=${details.limit}&offset=0`,
    };
    pageLinks[nrOfBatches] = {
      href: `${details.url}?limit=${details.limit}&offset=${(nrOfBatches - 1) * details.limit}`,
    };

    const midIndex = Math.floor(nrOfBatches / 2);
    pageLinks[midIndex] = {
      href: `${details.url}?limit=${details.limit}&offset=${(midIndex - 1) * details.limit}`,
    };
    pageLinks[midIndex + 1] = {
      href: `${details.url}?limit=${details.limit}&offset=${midIndex * details.limit}`,
    };

    if (nrOfBatches % 2 !== 0) {
      pageLinks[midIndex - 1] = {
        href: `${details.url}?limit=${details.limit}&offset=${(midIndex - 2) * details.limit}`,
      };
    }
  }

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
    pages: pageLinks,
  };
};
