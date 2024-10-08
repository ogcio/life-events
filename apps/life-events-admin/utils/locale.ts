export const LANG_EN = "en";
export const LANG_GA = "ga";
export function translate(
  record: Record<typeof LANG_EN | string, string | object>,
  locale: string,
  key?: string,
) {
  if (typeof record[locale] === "object" && key) {
    return record[locale][key];
  }
  return record[locale] ?? record[LANG_EN];
}
