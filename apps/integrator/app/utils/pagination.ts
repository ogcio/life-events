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
          process.env.INTEGRATOR_BACKEND_URL,
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
