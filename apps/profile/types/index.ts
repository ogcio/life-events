export type NextPageProps = {
  params: {
    locale: string;
    id?: string;
  };
  searchParams?: {
    [key: string]: string;
  };
};
