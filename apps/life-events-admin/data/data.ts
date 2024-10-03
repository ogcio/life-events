type CategoryTable = {
  id: string;
  en_name: string;
  ga_name: string;
  icon: string;
};

type SubcategoryTable = {
  id: string;
  category_id: string;
  title_en: string;
  title_ga: string;
  text_en: string;
  text_ga: string;
};

type SubcategoryItemTable = {
  id: string;
  subcategory_id: string;
  link_1_href: string;
  link_1_name_en: string;
  link_1_name_ga: string;
  link_1_is_external: boolean;
  link_2_href: string;
  link_2_name_en: string;
  link_2_name_ga: string;
  link_2_is_external: boolean;
  link_3_href: string;
  link_3_name_en: string;
  link_3_name_ga: string;
  link_3_is_external: boolean;
  text_en: string;
  title_en: string;
  text_ga: string;
  title_ga: string;
};

type Lang = {
  en: string;
  ga: string;
};

export type CategoryListModel = {
  id: string;
  name: Lang;
  icon: string;
};

export type CategoryModel = {
  id: string;
  name: Lang;
  subcategories: SubcategoryModel[];
};

type Link = { href: string; name: Lang; isExternal: boolean } | null;
export type SubcategoryModel = {
  id: string;
  title: Lang;
  text: Lang;
  items: SubcategoryItemModel[];
};

export type SubcategoryItemModel = {
  id: string;
  links: [Link, Link, Link];
  title: Lang;
  text: Lang;
};

const subcategoryTable: SubcategoryTable[] = [
  {
    id: "later-years-sub",
    category_id: "later-years",
    text_en:
      "Not everyone thinks about this until it's too late. Making a will is very important and  helps protect your loved ones after you're gone.",
    text_ga:
      "Ní cheapann gach duine faoi seo go dtí go bhfuil sé ró-dhéanach. Tá sé an-tábhachtach uacht a dhéanamh agus cuidíonn sé le do mhuintir a chosaint tar éis duit imeacht.",
    title_en: "Making a Will",
    title_ga: "Uacht a Dhéanamh",
  },
];

const subcategoryItemsTable: SubcategoryItemTable[] = [
  {
    id: "1",
    subcategory_id: "later-years-sub",
    link_1_href: "/",
    link_1_is_external: false,
    link_1_name_en: "Read more",
    link_1_name_ga: "Léigh níos mó",
    link_2_href: "/",
    link_2_is_external: true,
    link_2_name_en: "Create a Will online",
    link_2_name_ga: "Cruthaigh Uacht ar líne",
    link_3_href: "/",
    link_3_name_en: "FAQs",
    link_3_name_ga: "FAQs",
    link_3_is_external: false,
    text_en: "Read advice from the Citizen's Advice Bureau",
    text_ga: "Léigh comhairle ó na Citizen's Advice Bureau",
    title_en: "Why make a will",
    title_ga: "Cén fáth a dhéanamh uacht",
  },
  {
    id: "2",
    subcategory_id: "later-years-sub",
    link_1_href: "/",
    link_1_is_external: false,
    link_1_name_en: "Find a Solicitor near you",
    link_1_name_ga: "Aimsigh Aturnae in aice leat",
    link_2_href: "/",
    link_2_is_external: true,
    link_2_name_en: "FAQs",
    link_2_name_ga: "FAQs",
    link_3_href: "",
    link_3_name_en: "",
    link_3_name_ga: "",
    link_3_is_external: false,
    text_en: "Affordable legal services for all your needs",
    text_ga: "Seirbhísí dlí inacmhainne do do chuid riachtanas go léir",
    title_en: "Find a Solicitor",
    title_ga: "Aimsigh Aturnae",
  },
];

const categoriesTable: CategoryTable[] = [
  {
    en_name: "Birth",
    ga_name: "Breith",
    id: "birth",
    icon: "",
  },
  {
    en_name: "Health",
    ga_name: "Sláinte",
    id: "heath",
    icon: "",
  },
  {
    en_name: "Driving",
    ga_name: "Tiomáint",
    id: "driving",
    icon: "",
  },
  {
    en_name: "Employment",
    ga_name: "Fostaíocht",
    id: "employment",
    icon: "",
  },
  {
    en_name: "Starting a business",
    ga_name: "Gnó a thosú",
    id: "start-a-business",
    icon: "",
  },
  {
    en_name: "Housing",
    ga_name: "Tithíocht",
    id: "housing",
    icon: "",
  },
  {
    en_name: "Later years",
    ga_name: "Blianta ina dhiaidh sin",
    id: "later-years",
    icon: "",
  },
];

export const data = {
  async getCategories(): Promise<CategoryListModel[]> {
    return categoriesTable.map((row) => ({
      id: row.id,
      icon: row.icon,
      name: {
        en: row.en_name,
        ga: row.ga_name,
      },
    }));
  },

  async getCategory(id: string): Promise<CategoryModel> {
    const category = categoriesTable.find((cat) => cat.id === id);
    if (!category) {
      return Promise.reject("not found");
    }

    const subcategories = subcategoryTable.filter((s) => s.category_id === id);

    return {
      id: category.id,
      name: {
        en: category.en_name,
        ga: category.ga_name,
      },
      subcategories: subcategories.map((row) => ({
        id: row.id,
        text: {
          en: row.text_en,
          ga: row.text_ga,
        },
        title: {
          en: row.title_en,
          ga: row.title_ga,
        },
        items: subcategoryItemsTable
          .filter((item) => item.subcategory_id === row.id)
          .map((item) => {
            const links: [Link, Link, Link] = [null, null, null];
            if (item.link_1_href) {
              links[0] = {
                href: item.link_1_href,
                isExternal: item.link_1_is_external,
                name: { en: item.link_1_name_en, ga: item.link_1_name_ga },
              };
            }
            if (item.link_2_href) {
              links[1] = {
                href: item.link_2_href,
                isExternal: item.link_2_is_external,
                name: { en: item.link_2_name_en, ga: item.link_2_name_ga },
              };
            }
            if (item.link_3_href) {
              links[2] = {
                href: item.link_3_href,
                isExternal: item.link_3_is_external,
                name: { en: item.link_3_name_en, ga: item.link_3_name_ga },
              };
            }

            return {
              id: item.id,
              links: links,
              title: {
                en: item.title_en,
                ga: item.title_ga,
              },
              text: {
                en: item.text_en,
                ga: item.text_ga,
              },
            };
          }),
      })),
    };
  },
};
