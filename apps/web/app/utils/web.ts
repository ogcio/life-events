// General global utils for the web app

export type NextPageProps = {
  params: { event: string; action: string[]; locale: string };
  searchParams?: {
    [key: string]: string;
  };
};

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(amount / 100);
}

export const languages = {
  EN: "EN",
  GA: "GA",
} as const;

export const drivers = {
  licencePaymentAgeThreshold: 70,
  licenceMedicalFormAgeThreshold: 75,
};
