// General global utils for the web app

export type NextPageProps = {
  params: { event: string; action: string[]; locale: string };
  searchParams?: {
    [key: string]: string;
  };
};

export const envUAT = "UAT";
export const envDevelopment = "DEV";
export const envStaging = "STA";
export const envProduction = "PRD";
