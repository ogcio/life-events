import { getTranslations } from "next-intl/server";

type Props = {
  params: {
    locale: string;
  };
};

export default async (props: Props) => {
  const t = await getTranslations();
  return <h1>{t("title")}</h1>;
};
