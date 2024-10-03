export const LANG_EN = "en";
export const LANG_GA = "ga";
export function translate(
  record: Record<typeof LANG_EN | string, string>,
  locale: string,
) {
  return record[locale] ?? record[LANG_EN];
}
