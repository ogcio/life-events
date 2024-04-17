export type NextPageProps = {
  params: {
    locale: string;
    id?: string;
    type?: string;
  };
  searchParams?: {
    [key: string]: string;
  };
};
