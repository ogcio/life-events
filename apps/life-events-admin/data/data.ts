import { lifeEventsPool } from "./postgres";

type Lang = {
  en: string;
  ga: string;
};

export type CategoryTableModel = {
  categoryId: string;
  categoryName: Lang;
  subcategoryId: string;
  subcategoryName: Lang;
};

export type CategoryModel = {
  id: string;
  name: Lang;
  subcategories: SubcategoryModel[];
};

type Link = { href: string; name: Lang; isExternal: boolean };
export type SubcategoryModel = {
  id: string;
  title: Lang;
  text: Lang;
  items: SubcategoryItemModel[];
};

export type SubcategoryUpdateModel = {
  id: string;
  title: Lang;
  text: Lang;
};

export type SubcategoryItemModel = {
  id: string;
  links: [Link, Link, Link];
  title: Lang;
  text: Lang;
};

type CategoryTableQueryRow = {
  category_id: string;
  category_icon: string;
  category_name_en: string;
  category_name_ga: string;
  subcategory_id: string;
  subcategory_name_en: string;
  subcategory_name_ga: string;
};

type SubcategoryFormQueryRow = {
  sub_id: string;
  sub_title_en: string;
  sub_title_ga: string;
  sub_text_en: string;
  sub_text_ga: string;
  item_id: string;
  item_title_en: string;
  item_title_ga: string;
  item_text_en: string;
  item_text_ga: string;
  item_links: {
    id: string;
    href: string;
    name_en: string;
    name_ga: string;
    isExternal: boolean;
  }[];
};

type FullCategoryQueryRow = {
  category_id: string;
  category_name_en: string;
  category_name_ga: string;
  sub_id: string;
  sub_title_en: string;
  sub_title_ga: string;
  sub_text_en: string;
  sub_text_ga: string;
  item_id: string;
  item_title_en: string;
  item_title_ga: string;
  item_text_en: string;
  item_text_ga: string;
  item_links: {
    href: string;
    name_en: string;
    name_ga: string;
    isExternal: boolean;
  }[];
};

export const data = {
  category: {
    async table(): Promise<CategoryTableModel[]> {
      const queryResult = await lifeEventsPool.query<CategoryTableQueryRow>(`
        select 
            c.id as category_id,
            c.icon as category_icon,
            c.name_en as category_name_en,
            c.name_ga as category_name_ga,
            s.id as subcategory_id,
            s.title_en as subcategory_name_en,
            s.title_ga as subcategory_name_ga
        from categories c
        left join subcategories s on s.category_id = c.id        
        `);

      const categoryTableModels: CategoryTableModel[] = [];

      for (const row of queryResult.rows) {
        categoryTableModels.push({
          categoryId: row.category_id,
          categoryName: {
            en: row.category_name_en,
            ga: row.category_name_ga,
          },
          subcategoryId: row.subcategory_id,
          subcategoryName: {
            en: row.subcategory_name_en,
            ga: row.subcategory_name_ga,
          },
        });
      }

      return categoryTableModels;
    },

    async one(id: string): Promise<CategoryModel> {
      const queryResult = await lifeEventsPool.query<FullCategoryQueryRow>(
        `
            select
                c.id as category_id,
                c.name_en as category_name_en,
                c.name_ga as category_name_ga,
                s.id as sub_id,
                s.title_en as sub_title_en,
                s.title_ga as sub_title_ga,
                s.text_en as sub_text_en,
                s.text_ga as sub_text_ga,
                i.id as item_id,
                i.title_en as item_title_en,
                i.title_ga as item_title_ga,
                i.text_en as item_text_en,
                i.text_ga as item_text_ga,
                i.links as item_links
            from categories c
            left join subcategories s on s.category_id = c.id
            left join subcategory_items i on i.subcategory_id = s.id
            where c.id = $1
            order by s.created_at
            `,
        [id],
      );

      let category1: CategoryModel | null = null;

      for (const row of queryResult.rows) {
        if (!category1) {
          category1 = {
            id: row.category_id,
            name: { en: row.category_name_en, ga: row.category_name_ga },
            subcategories: [],
          };
        }

        const rowSubcategory = category1.subcategories.find(
          (sub) => sub.id === row.sub_id,
        );

        const links: [Link, Link, Link] = [
          {
            href: row.item_links[0]?.href || "",
            isExternal: Boolean(row.item_links[0]?.isExternal),
            name: {
              en: row.item_links[0]?.name_en || "",
              ga: row.item_links[0].name_ga || "",
            },
          },
          {
            href: row.item_links[1]?.href || "",
            isExternal: Boolean(row.item_links[1]?.isExternal),
            name: {
              en: row.item_links[1]?.name_en || "",
              ga: row.item_links[1]?.name_ga || "",
            },
          },
          {
            href: row.item_links[2]?.href || "",
            isExternal: Boolean(row.item_links[2]?.isExternal),
            name: {
              en: row.item_links[2]?.name_en || "",
              ga: row.item_links[2]?.name_ga || "",
            },
          },
        ];

        const items = [
          {
            id: row.item_id,
            links,
            text: {
              en: row.item_text_en,
              ga: row.item_text_ga,
            },
            title: {
              en: row.item_title_en,
              ga: row.item_title_ga,
            },
          },
        ];

        if (!rowSubcategory) {
          category1.subcategories.push({
            id: row.sub_id,
            items,
            text: {
              en: row.sub_text_en,
              ga: row.sub_text_ga,
            },
            title: {
              en: row.sub_title_en,
              ga: row.sub_title_ga,
            },
          });
        } else if (
          !rowSubcategory.items.some((item) => item.id === row.item_id)
        ) {
          rowSubcategory.items.push(...items);
        }
      }

      if (!category1) {
        throw new Error("not_found");
      }

      return category1;
    },
  },
  subcategory: {
    async formData(id: string): Promise<SubcategoryModel> {
      const queryResult = await lifeEventsPool.query<SubcategoryFormQueryRow>(
        `
        select
            s.id as sub_id,
            s.title_en as sub_title_en,
            s.title_ga as sub_title_ga,
            s.text_en as sub_text_en,
            s.text_ga as sub_text_ga,
            i.id as item_id,
            i.title_en as item_title_en,
            i.title_ga as item_title_ga,
            i.text_en as item_text_en,
            i.text_ga as item_text_ga,
            i.links as item_links
        from subcategories s
        left join subcategory_items i on i.subcategory_id = s.id
        where s.id = $1
        order by i.created_at
        `,
        [id],
      );

      let subcategoryModel: SubcategoryModel | undefined;

      for (const row of queryResult.rows) {
        const links: [Link, Link, Link] = [
          {
            href: row.item_links[0]?.href || "",
            isExternal: Boolean(row.item_links[0]?.isExternal),
            name: {
              en: row.item_links[0]?.name_en || "",
              ga: row.item_links[0].name_ga || "",
            },
          },
          {
            href: row.item_links[1]?.href || "",
            isExternal: Boolean(row.item_links[1]?.isExternal),
            name: {
              en: row.item_links[1]?.name_en || "",
              ga: row.item_links[1]?.name_ga || "",
            },
          },
          {
            href: row.item_links[2]?.href || "",
            isExternal: Boolean(row.item_links[2]?.isExternal),
            name: {
              en: row.item_links[2]?.name_en || "",
              ga: row.item_links[2]?.name_ga || "",
            },
          },
        ];

        const items = [
          {
            id: row.item_id,
            links,
            text: {
              en: row.item_text_en,
              ga: row.item_text_ga,
            },
            title: {
              en: row.item_title_en,
              ga: row.item_title_ga,
            },
          },
        ];
        if (!subcategoryModel) {
          subcategoryModel = {
            id: row.sub_id,
            items,
            title: {
              en: row.sub_title_en,
              ga: row.sub_title_ga,
            },
            text: {
              en: row.sub_text_en,
              ga: row.sub_text_ga,
            },
          };
        } else {
          subcategoryModel.items.push(...items);
        }
      }

      if (!subcategoryModel) {
        throw new Error("not_found");
      }

      return subcategoryModel;
    },
    async update(subcategory: SubcategoryUpdateModel): Promise<void> {
      try {
        await lifeEventsPool.query(
          `
                update subcategories
                set 
                    title_en = $2,
                    title_ga = $3,
                    text_en = $4,
                    text_ga = $5
                where id=$1
                `,
          [
            subcategory.id,
            subcategory.title.en,
            subcategory.title.ga,
            subcategory.text.en,
            subcategory.text.ga,
          ],
        );
      } catch (err) {
        console.log(err);
        throw new Error("update_fail");
      }
    },
  },
  subcategoryItem: {
    async update(item: SubcategoryItemModel): Promise<void> {
      try {
        await lifeEventsPool.query(
          `
                update subcategory_items
                set
                    title_en = $2,
                    title_ga = $3,
                    text_en = $4,
                    text_ga  = $5,
                    links = $6
                where id = $1
                `,
          [
            item.id,
            item.title.en,
            item.title.ga,
            item.text.en,
            item.text.ga,
            JSON.stringify(
              item.links.map((link) => ({
                href: link.href,
                isExternal: link.isExternal,
                name_en: link.name.en,
                name_ga: link.name.ga,
              })),
            ),
          ],
        );
      } catch (err) {
        console.log(err);
        throw new Error("update_fail");
      }
    },
  },
};
