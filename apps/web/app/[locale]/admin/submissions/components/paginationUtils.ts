/**
 * Pagination
 */

export const PAGINATION_PAGE_DEFAULT = 1;
export const PAGINATION_LIMIT_DEFAULT = 10;
export const PAGINATION_OFFSET_DEFAULT = 0;

export type PaginationLink = {
  href?: string;
};
export type PaginationLinks = {
  self: PaginationLink;
  next?: PaginationLink;
  prev?: PaginationLink;
  first: PaginationLink;
  last: PaginationLink;
  pages: Record<string, PaginationLink>;
};

export const offsetToPage = (
  offset: number = PAGINATION_OFFSET_DEFAULT,
  limit: number = PAGINATION_LIMIT_DEFAULT,
) => {
  return Math.floor(offset / limit) + 1;
};

export const pageToOffset = (
  page: number = PAGINATION_PAGE_DEFAULT,
  limit: number = PAGINATION_LIMIT_DEFAULT,
) => {
  return (page - 1) * limit;
};

export const buildPaginationLinks = (
  targetUrl: string,
  links?: PaginationLinks,
): PaginationLinks => {
  if (!links) {
    return {
      self: { href: undefined },
      next: { href: undefined },
      prev: { href: undefined },
      first: { href: undefined },
      last: { href: undefined },
      pages: {},
    };
  }

  const { pages: pagesLinks, ...paginationLinks } = links;

  const buildLinks = (data: Record<string, PaginationLink>) => {
    return Object.entries(data).reduce<Record<string, PaginationLink>>(
      (acc, [key, link]) => {
        if (!link.href) {
          acc[key] = {
            href: undefined,
          };
          return acc;
        }

        const url = new URL(
          link.href as string,
          process.env.PAYMENTS_BACKEND_URL,
        );
        const offset = parseInt(url.searchParams.get("offset") ?? "0");
        const limit = parseInt(url.searchParams.get("limit") ?? "10");

        acc[key] = {
          href: `${targetUrl}?limit=${limit}&page=${offsetToPage(offset, limit)}`,
        };

        return acc;
      },
      {},
    );
  };

  return {
    ...buildLinks(paginationLinks),
    pages: buildLinks(pagesLinks),
  } as PaginationLinks;
};

export type PaginationDetails = {
  offset: number;
  limit: number;
  totalCount: number;
  url: string;
};

const generatePageLinks = (
  details: PaginationDetails,
): Record<string, PaginationLink> => {
  const pageLinks: Record<string, PaginationLink> = {};
  const nrOfBatches = Math.ceil(details.totalCount / details.limit);

  if (nrOfBatches <= 1) {
    return pageLinks;
  }

  const url = new URL(details.url);
  const params = new URLSearchParams(url.search);

  if (nrOfBatches <= 5) {
    for (
      let i = 0, calculatedOffset = 0;
      i < nrOfBatches;
      i++, calculatedOffset += details.limit
    ) {
      params.set(
        "page",
        offsetToPage(calculatedOffset, details.limit).toString(),
      );
      params.set("limit", details.limit.toString());
      pageLinks[i + 1] = {
        href: `${url.pathname}?${params.toString()}`,
      };
    }
  }
  return pageLinks;
};

export const getPaginationLinks = (details: PaginationDetails) => {
  const url = new URL(details.url);
  let params = new URLSearchParams(url.search);

  params.set("limit", details.limit.toString());
  params.set("page", offsetToPage(details.offset, details.limit).toString());
  const self = {
    href: `${url.pathname}?${params.toString()}`,
  };

  params = new URLSearchParams(url.search);
  const next: { href?: string } = { href: undefined };

  if (details.offset + details.limit < details.totalCount) {
    params.set("limit", details.limit.toString());
    params.set(
      "page",
      offsetToPage(details.offset + details.limit, details.limit).toString(),
    );
    next.href = `${url.pathname}?${params.toString()}`;
  }

  params = new URLSearchParams(url.search);
  const prev: { href?: string } = { href: undefined };
  if (details.offset - details.limit >= 0) {
    params.set("limit", details.limit.toString());
    params.set(
      "page",
      offsetToPage(details.offset - details.limit, details.limit).toString(),
    );
    prev.href = `${url.pathname}?${params.toString()}`;
  }

  params = new URLSearchParams(url.search);
  params.set("limit", details.limit.toString());
  params.set("page", "1");
  const first = {
    href: `${url.pathname}?${params.toString()}`,
  };

  params = new URLSearchParams(url.search);
  params.set("limit", details.limit.toString());
  if (details.totalCount > 0) {
    params.set(
      "page",
      offsetToPage(
        Math.ceil(details.totalCount / details.limit) * details.limit -
          details.limit,
        details.limit,
      ).toString(),
    );
  } else {
    params.set("page", "1");
  }
  const last = {
    href: `${url.pathname}?${params.toString()}`,
  };

  return {
    self,
    next,
    prev,
    first,
    last,
    pages: generatePageLinks(details),
  };
};

export type QueryParams = {
  offset: number;
  limit: number;
  page: number;
  search?: string;
  filters: Record<string, string>;
};

export const getQueryParams = (params: URLSearchParams): QueryParams => {
  const page = params.get("page");
  const limit = params.get("limit");
  const searchQuery = params.get("search") || undefined;

  const currentPage = page ? parseInt(page) : PAGINATION_PAGE_DEFAULT;
  const pageLimit = limit ? parseInt(limit) : PAGINATION_LIMIT_DEFAULT;

  const deviceType = (params.get("deviceType") as "ios" | "android") || "";
  const verifiedEmail = (params.get("verifiedEmail") as "yes" | "no") || "";

  const filters = {} as Record<string, string>;

  if (verifiedEmail.length > 0) {
    filters.verifiedEmail = verifiedEmail;
  }
  if (deviceType.length > 0) {
    filters.deviceType = deviceType;
  }

  const pagination = {
    offset: pageToOffset(currentPage, pageLimit),
    limit: pageLimit,
    page: currentPage,
    search: searchQuery,
    filters,
  };

  return pagination;
};
