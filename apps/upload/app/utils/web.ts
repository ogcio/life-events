// General global utils for the web app

import dayjs from "dayjs";

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

export function formatDate(date: string | Date) {
  return dayjs(date).format("DD/MM/YYYY");
}

export const languages = {
  EN: "EN",
  GA: "GA",
} as const;

export const drivers = {
  licencePaymentAgeThreshold: 70,
  licenceMedicalFormAgeThreshold: 75,
};

export const envUAT = "UAT";
export const envDevelopment = "DEV";
export const envStaging = "STA";
export const envProduction = "PRD";
