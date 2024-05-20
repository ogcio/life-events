import { getTranslations } from "next-intl/server";
import { PAGINATION_PAGE_DEFAULT, PaginationLinks } from "../utils";

export type PaginationProps = {
  links: PaginationLinks;
  currentPage: number | undefined;
};

export default async function Pagination({
  links,
  currentPage = PAGINATION_PAGE_DEFAULT,
}: PaginationProps) {
  const t = await getTranslations("Pagination");
  let previousPage = 0;

  return (
    <div
      className="pagination"
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <nav
        aria-label="navigation results"
        role="navigation"
        className="govie-pagination"
      >
        {links.prev?.href && (
          <div className="govie-pagination__prev">
            <a
              className="govie-link govie-pagination__link"
              href={links.prev.href}
            >
              <svg
                className="govie-pagination__icon govie-pagination__icon--prev"
                xmlns="http://www.w3.org/2000/svg"
                height="13"
                width="15"
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 15 13"
              >
                <path d="m6.5938-0.0078125-6.7266 6.7266 6.7441 6.4062 1.377-1.449-4.1856-3.9768h12.896v-2h-12.984l4.2931-4.293-1.414-1.414z"></path>
              </svg>
              <span className="govie-pagination__link-title">
                {t("previous")}
              </span>
            </a>
          </div>
        )}

        <ul className="govie-pagination__list">
          {Object.entries(links.pages).map(([page, link]) => {
            const pageNr = parseInt(page);
            const isGap = pageNr - previousPage > 1;
            previousPage = pageNr;

            return (
              <>
                {isGap && (
                  <li
                    className="govie-pagination__item govie-pagination__item--ellipses"
                    key={`space-${page}`}
                  >
                    ⋯
                  </li>
                )}
                <li
                  className={`govie-pagination__item ${pageNr === currentPage ? "govie-pagination__item--current" : ""}`}
                  key={page}
                >
                  <a
                    className="govie-link govie-pagination__link"
                    href={link.href}
                    aria-label={`Page ${page}`}
                    aria-current="page"
                  >
                    {page}
                  </a>
                </li>
              </>
            );
          })}
        </ul>

        {links.next?.href && (
          <div className="govie-pagination__next">
            <a
              className="govie-link govie-pagination__link"
              href={links.next.href}
            >
              <span className="govie-pagination__link-title">{t("next")}</span>
              <svg
                className="govie-pagination__icon govie-pagination__icon--next"
                xmlns="http://www.w3.org/2000/svg"
                height="13"
                width="15"
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 15 13"
              >
                <path d="m8.107-0.0078125-1.4136 1.414 4.2926 4.293h-12.986v2h12.896l-4.1855 3.9766 1.377 1.4492 6.7441-6.4062-6.7246-6.7266z"></path>
              </svg>
            </a>
          </div>
        )}
      </nav>
    </div>
  );
}
