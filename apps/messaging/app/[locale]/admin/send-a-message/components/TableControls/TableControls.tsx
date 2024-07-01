import styles from "./TableControls.module.scss";
import { RedirectType, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { QueryParams } from "../paginationUtils";

type TableControlsProps = QueryParams & {
  itemsCount: number;
  baseUrl: string;
};

export default async ({
  itemsCount,
  baseUrl,
  search,
  limit,
}: TableControlsProps) => {
  const t = await getTranslations("TableControls");

  const handleChange = async (formData: FormData) => {
    "use server";

    const url = new URL(baseUrl);
    const searchParams = url.searchParams;

    const searchQuery = (formData.get("search-query") as string).trim();
    if (searchQuery.length > 0) {
      searchParams.set("search", searchQuery);
    }

    searchParams.set("limit", formData.get("items-per-page") as string);
    searchParams.set("page", "1");

    redirect(url.toString(), RedirectType.replace);
  };

  return (
    <div>
      <form action={handleChange}>
        <div className={styles.controlsBar}>
          <div className="govie-form-group">
            <p className="govie-label--s">
              {t("itemsCount")}: <span>{itemsCount}</span>
            </p>
          </div>
          <div className={`govie-form-group ${styles.selectGroup}`}>
            <label className="govie-label--s" htmlFor="items-per-page">
              {t("itemsPerPage")}
            </label>
            <select
              className="govie-select"
              id="items-per-page"
              name="items-per-page"
              defaultValue={limit}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        <div className={styles.controlsBar}>
          <div className={`govie-form-group ${styles.selectGroup}`}>
            <label htmlFor="search-query" className="govie-label--s">
              {t("searchUser")}
            </label>
            <input
              type="text"
              id="search-query"
              name="search-query"
              className="govie-input govie-!-width-one-half"
              defaultValue={search}
            />
          </div>
        </div>
        <div className={`${styles.selectGroup} ${styles.reverse}`}>
          <input
            type="submit"
            id="button"
            data-module="govie-button"
            className="govie-button"
            value={t("submit")}
          />
        </div>
      </form>
    </div>
  );
};
