import { getTranslations } from "next-intl/server";
import { PaginationLinks } from "../utils";

export type PaginationProps = {
  links: PaginationLinks;
};

export default async function Pagination({ links }: PaginationProps) {
  const t = await getTranslations("Pagination");

  return (
    <div className="pagination">
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
            return (
              <li className="govie-pagination__item">
                <a
                  className="govie-link govie-pagination__link"
                  href={link.href}
                  aria-label="Page 1"
                  aria-current="page"
                >
                  {page}
                </a>
              </li>
            );
          })}

          {/* <li className="govie-pagination__item">
                        <a
                            className="govie-link govie-pagination__link"
                            href="#"
                            aria-label="Page 1"
                            aria-current="page"
                        >
                            1
                        </a>
                    </li>

                    <li className="govie-pagination__item govie-pagination__item--ellipses">⋯</li>

                    <li className="govie-pagination__item">
                        <a className="govie-link govie-pagination__link" href="#" aria-label="Page 2" aria-current="page">6</a>
                    </li>
                    <li className="govie-pagination__item govie-pagination__item--current">
                        <a className="govie-link govie-pagination__link" href="#" aria-label="Page 3" aria-current="page">7</a>
                    </li>
                    <li className="govie-pagination__item">
                        <a className="govie-link govie-pagination__link" href="#" aria-label="Page 4" aria-current="page">8</a>
                    </li>

                    <li className="govie-pagination__item govie-pagination__item--ellipses">⋯</li>

                    <li className="govie-pagination__item">
                        <a className="govie-link govie-pagination__link" href="#" aria-label="Page 5" aria-current="page">40</a>
                    </li> */}
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
