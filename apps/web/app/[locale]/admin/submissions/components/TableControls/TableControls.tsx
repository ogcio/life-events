import { FormEvent } from "react";
import styles from "./TableControls.module.scss";
import { RedirectType, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { QueryParams } from "../paginationUtils";
import { Pages } from "../../page";

type TableControlsProps = QueryParams & {
  itemsCount: number;
  baseUrl: string;
  status: Pages;
};

export default async ({
  itemsCount,
  baseUrl,
  search,
  limit,
  filters,
  status,
}: TableControlsProps) => {
  const t = await getTranslations("Admin.TableControls");

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

    const deviceType = formData.get("device-type") as string;
    if (deviceType.length > 0) {
      searchParams.set("deviceType", deviceType);
    }

    const verifiedEmail = formData.get("verified-email") as string;
    if (verifiedEmail.length > 0) {
      searchParams.set("verifiedEmail", verifiedEmail);
    }

    redirect(url.toString(), RedirectType.replace);
  };

  const deviceType = filters.deviceType || "";
  let verifiedEmail = "";
  if (filters.verifiedGovIEEmail === "true") {
    verifiedEmail = "yes";
  } else if (filters.verifiedGovIEEmail === "false") {
    verifiedEmail = "no";
  }

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

          <div className={`govie-form-group ${styles.selectGroup}`}>
            <label className="govie-label--s" htmlFor="device-type">
              {t("deviceType")}
            </label>
            <select
              className="govie-select"
              id="device-type"
              name="device-type"
              defaultValue={deviceType}
            >
              <option value="">{t("all")}</option>
              <option value="ios">{t("ios")}</option>
              <option value="android">{t("android")}</option>
            </select>
          </div>

          <div
            className={`govie-form-group ${styles.selectGroup} ${status === "pending" && styles.hidden}`}
          >
            <label className="govie-label--s" htmlFor="verified-email">
              {t("verifiedEmail")}
            </label>
            <select
              className="govie-select"
              id="verified-email"
              name="verified-email"
              defaultValue={verifiedEmail}
            >
              <option value="">{t("all")}</option>
              <option value="yes">{t("yes")}</option>
              <option value="no">{t("no")}</option>
            </select>
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
