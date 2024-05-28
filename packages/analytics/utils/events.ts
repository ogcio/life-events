export default function send(
  category: string,
  action: string,
  name?: string,
  value?: number,
  customDimensions?: Dimensions,
): void {
  if (!window._paq) {
    window._paq = [];
  }
  window._paq.push([
    "trackEvent",
    category,
    action,
    name,
    value,
    customDimensions,
  ]);
}
