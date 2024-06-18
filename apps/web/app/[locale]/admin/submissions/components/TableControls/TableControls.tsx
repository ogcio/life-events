import { FormEvent } from "react";
import styles from "./TableControls.module.scss";
import { RedirectType, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

type TableControlsProps = {
  itemsCount: number;
  itemsPerPage: number;
  baseUrl: string;
};

export default async ({
  itemsCount,
  itemsPerPage,
  baseUrl,
}: TableControlsProps) => {
  const t = await getTranslations("Admin.TableControls");

  const handleChange = async (formData: FormData) => {
    "use server";

    const url = new URL(baseUrl);
    const searchParams = url.searchParams;

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
              defaultValue={itemsPerPage}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <input
              type="submit"
              id="button"
              data-module="govie-button"
              className="govie-button govie-button--medium"
              value={t("change")}
            />
          </div>
        </div>
      </form>
      {/* <div className={`govie-form-group ${styles.selectGroup}`}>
        <label htmlFor="input-field" className="govie-label--s">
          Search for user:
        </label>
        <input
          type="text"
          id="input-field"
          name="input-field"
          className="govie-input govie-!-width-one-half"
        />
        <input
          type="submit"
          id="button"
          data-module="govie-button"
          className="govie-button govie-button--medium"
          value="Change"
        />
      </div> */}
    </div>
  );
};
