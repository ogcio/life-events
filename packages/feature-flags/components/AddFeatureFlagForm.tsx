import { getTranslations } from "next-intl/server";
import { pgpool } from "../dbConnection";
import { revalidatePath } from "next/cache";

export default async ({ application }: { application: string }) => {
  async function addFlag(formData: FormData) {
    "use server";
    const title = formData.get("title");
    const description = formData.get("description");
    const isEnabled = !!formData.get("isEnabled");
    const slug = formData.get("slug");
    await pgpool.query(
      `INSERT INTO feature_flags (application, slug, title, description, is_enabled) VALUES ($1, $2, $3, $4, $5)`,
      [application, slug, title, description, isEnabled]
    );
    revalidatePath("/");
  }

  const t = await getTranslations("FeatureFlags");
  return (
    <>
      {/* @ts-ignore action type is from React, but should be from Next*/}
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
    </>
  );
};
