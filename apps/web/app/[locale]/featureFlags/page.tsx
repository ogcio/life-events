import { getTranslations } from "next-intl/server";
import { pgpool } from "../../sessions";
import { revalidatePath } from "next/cache";
import { getFeatureFlags } from "../../utils";

const AddFeatureFlagForm = async () => {
  async function addFlag(formData: FormData) {
    "use server";
    const title = formData.get("title");
    const description = formData.get("description");
    const isEnabled = !!formData.get("isEnabled");
    const slug = formData.get("slug");
    await pgpool.query(
      `INSERT INTO feature_flags (slug, title, description, is_enabled) VALUES ($1, $2, $3, $4)`,
      [slug, title, description, isEnabled]
    );
    revalidatePath("/");
  }

  const t = await getTranslations("FeatureFlags");
  return (
    <form action={addFlag}>
      <h2 className="govie-heading-m">{t("add")}</h2>

      <div className="govie-form-group">
        <div className="govie-hint" id="slug-hint">
          {t("form.slug")}
        </div>
        <input
          type="text"
          id="slug"
          name="slug"
          className="govie-input"
          aria-describedby="slug-hint"
          required
        />
      </div>
      <div className="govie-form-group">
        <div className="govie-hint" id="title-hint">
          {t("form.title")}
        </div>
        <input
          type="text"
          id="title"
          name="title"
          className="govie-input"
          aria-describedby="title-hint"
          required
        />
      </div>
      <div className="govie-form-group">
        <div className="govie-hint" id="description-hint">
          {t("form.description")}
        </div>
        <input
          type="text"
          id="description"
          name="description"
          className="govie-input"
          aria-describedby="description-hint"
        />
      </div>
      <div className="govie-form-group">
        <div className="govie-checkboxes__item">
          <input
            className="govie-checkboxes__input"
            id="enabled-hint"
            name="isEnabled"
            type="checkbox"
          />
          <label
            className="govie-label--s govie-checkboxes__label"
            htmlFor="enabled-hint"
          >
            {t("form.enabled")}
          </label>
        </div>
      </div>
      <button className="govie-button">{t("form.save")}</button>
    </form>
  );
};

const FeatureFlagsList = async () => {
  async function deleteFlag(formData: FormData) {
    "use server";
    const slug = formData.get("slug");
    await pgpool.query("DELETE FROM feature_flags WHERE slug = $1", [slug]);
    revalidatePath("/");
  }

  async function changeFlagStatus(formData: FormData) {
    "use server";
    pgpool.query(
      "UPDATE feature_flags SET is_enabled = NOT is_enabled WHERE slug = $1",
      [formData.get("slug")]
    );
    revalidatePath("/");
  }

  const featureFlags = await getFeatureFlags();

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

export default async () => {
  const t = await getTranslations("FeatureFlags");

  return (
    <main className="govie-main-wrapper " id="main-content" role="main">
      <h1 className="govie-heading-l">{t("title")}</h1>
      <FeatureFlagsList />
      <AddFeatureFlagForm />
    </main>
  );
};
