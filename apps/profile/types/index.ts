export type NextPageProps = {
  params: { event: string; action: string[]; locale: string };
  searchParams?: {
    [key: string]: string;
  };
};
