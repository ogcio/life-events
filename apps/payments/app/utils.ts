export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(amount / 100);
}

export function stringToAmount(amount: string) {
  return Math.round(parseFloat(amount) * 100);
}
