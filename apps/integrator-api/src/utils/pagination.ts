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

const generatePageLinks = (details: PaginationDetails) => {
  const pageLinks: Record<string, { href: string }> = {};
  const nrOfBatches = Math.ceil(details.totalCount / details.limit);

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
    href: `${details.url}?limit=${details.limit}&offset=0`,
  };
  pageLinks[nrOfBatches] = {
    href: `${details.url}?limit=${details.limit}&offset=${(nrOfBatches - 1) * details.limit}`,
  };

  const currentBatch = Math.floor(details.offset / details.limit) + 1;

  if (currentBatch === 1) {
    pageLinks[2] = {
      href: `${details.url}?limit=${details.limit}&offset=${1 * details.limit}`,
    };
    pageLinks[3] = {
      href: `${details.url}?limit=${details.limit}&offset=${3 * details.limit}`,
    };
  } else if (currentBatch === nrOfBatches) {
    pageLinks[nrOfBatches - 2] = {
      href: `${details.url}?limit=${details.limit}&offset=${(nrOfBatches - 3) * details.limit}`,
    };
    pageLinks[nrOfBatches - 1] = {
      href: `${details.url}?limit=${details.limit}&offset=${(nrOfBatches - 2) * details.limit}`,
    };
  } else {
    pageLinks[currentBatch - 1] = {
      href: `${details.url}?limit=${details.limit}&offset=${(currentBatch - 2) * details.limit}`,
    };
    pageLinks[currentBatch] = {
      href: `${details.url}?limit=${details.limit}&offset=${(currentBatch - 1) * details.limit}`,
    };
    pageLinks[currentBatch + 1] = {
      href: `${details.url}?limit=${details.limit}&offset=${currentBatch * details.limit}`,
    };
  }

  return pageLinks;
};

export const getPaginationLinks = (details: PaginationDetails) => {
  return {
    self: {
      href: `${details.url}?limit=${details.limit}&offset=${details.offset}`,
    },
    next: {
      href:
        details.offset + details.limit < details.totalCount
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
    pages: generatePageLinks(details),
  };
};
