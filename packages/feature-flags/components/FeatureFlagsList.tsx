import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { getFeatureFlags } from "../utils";
import { pgpool } from "../dbConnection";

export default async ({ application }: { application: string }) => {
  async function deleteFlag(formData: FormData) {
    "use server";
    const slug = formData.get("slug");
    await pgpool.query(
      "DELETE FROM feature_flags WHERE application = $1 AND slug = $2",
      [application, slug]
    );
    revalidatePath("/");
  }

  async function changeFlagStatus(formData: FormData) {
    "use server";
    pgpool.query(
      "UPDATE feature_flags SET is_enabled = NOT is_enabled WHERE application = $1 AND slug = $2",
      [application, formData.get("slug")]
    );
    revalidatePath("/");
  }

  const featureFlags = await getFeatureFlags(application);

  const t = await getTranslations("FeatureFlags");
  return (
    <table className="govie-table">
      <thead className="govie-table__head">
        <tr className="govie-table__row">
          <th scope="col" className="govie-table__header">
            {t("form.slug")}
          </th>
          <th scope="col" className="govie-table__header">
            {t("form.title")}
          </th>
          <th scope="col" className="govie-table__header">
            {t("form.description")}
          </th>
          <th scope="col" className="govie-table__header">
            {t("form.enabled")}
          </th>
          <th scope="col" className="govie-table__header">
            {t("actions")}
          </th>
        </tr>
      </thead>
      <tbody className="govie-table__body">
        {featureFlags.map((flag) => (
          <tr className="govie-table__row" key={flag.slug}>
            <th className="govie-table__header" scope="row">
              {flag.slug}
            </th>
            <td className="govie-table__cell">{flag.title}</td>
            <td className="govie-table__cell">{flag.description}</td>
            <td className="govie-table__cell">
              {flag.is_enabled ? t("form.enabled") : t("form.disabled")}
            </td>

            <td className="govie-table__cell">
              <div style={{ display: "flex", gap: "10px" }}>
                {/* @ts-ignore action type is from React, but should be from Next*/}
                <form action={changeFlagStatus}>
                  <input name="slug" type="hidden" value={flag.slug} />
                  <button
                    id="button"
                    data-module="govie-button"
                    className="govie-button govie-button--small govie-button--primary"
                    type="submit"
                  >
                    {flag.is_enabled ? t("disable") : t("enable")}
                  </button>
                </form>
                {/* @ts-ignore action type is from React, but should be from Next*/}
                <form action={deleteFlag}>
                  <input name="slug" type="hidden" value={flag.slug} />
                  <button
                    id="button"
                    data-module="govie-button"
                    className="govie-button govie-button--small govie-button--tertiary"
                    type="submit"
                  >
                    {t("delete")}
                  </button>
                </form>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
