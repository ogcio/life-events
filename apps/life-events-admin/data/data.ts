import { lifeEventsPool } from "./postgres";

type Lang<T> = {
  en: T;
  ga: T;
};

type Breadcrumb = {
  href: string;
  label: string;
};

export type CategoryTableModel = {
  categoryId: string;
  categoryName: Lang<string>;
  subcategoryId: string;
  subcategoryName: Lang<string>;
};

export type CategoryModel = {
  id: string;
  name: Lang<string>;
  subcategories: SubcategoryModel[];
};

type Link = { href: string; name: Lang<string>; isExternal: boolean };
export type SubcategoryModel = {
  id: string;
  title: Lang<string>;
  text: Lang<string>;
  items: Pick<SubcategoryItemModel, "id" | "title">[];
};

export type SubcategoryUpdateModel = {
  id: string;
  title: Lang<string>;
  text: Lang<string>;
};

export type SubcategoryItemModel = {
  id: string;
  subcategoryId: string;
  links: [Link, Link, Link];
  title: Lang<string>;
  text: Lang<string>;
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
};

type SubcategoryItemQueryRow = {
  sub_id: string;
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

type CategoryBreadcrumbQueryRow = {
  name_en: string;
  name_ga: string;
};

type SubcategoryBreadcrumbQueryRow = {
  category_id: string;
  category_name_en: string;
  category_name_ga: string;
  sub_id: string;
  sub_name_en: string;
  sub_name_ga: string;
};

type SubcategoryItemBreadcrumbQueryRow = SubcategoryBreadcrumbQueryRow & {
  item_id: string;
  item_name_en: string;
  item_name_ga: string;
};

export const data = {
  category: {
    async breadcrumbs(categoryId: string): Promise<Lang<Breadcrumb>[]> {
      try {
        const queryResult =
          await lifeEventsPool.query<CategoryBreadcrumbQueryRow>(
            ` 
            select 
              name_en,
              name_ga
            from categories
            where id = $1
          `,
            [categoryId],
          );

        const row = queryResult.rows.at(0);

        if (!row) {
          throw new Error();
        }

        const breadcrumbs: Lang<Breadcrumb>[] = [
          {
            en: { href: "/en", label: "Home" },
            ga: { href: "/ga", label: "Abhaile" },
          },
          {
            en: { href: "", label: row.name_en },
            ga: { href: "", label: row.name_ga },
          },
          {
            en: { href: "", label: "New subcategory" },
            ga: { href: "", label: "Fochatagóir nua" },
          },
        ];

        return breadcrumbs;
      } catch (err) {
        console.log(err);
        throw new Error("breadcrumbs_failedF");
      }
    },
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
        order by c.sort_order  
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
    async breadcrumbs(subcategoryId: string): Promise<Lang<Breadcrumb>[]> {
      try {
        const queryResult =
          await lifeEventsPool.query<SubcategoryBreadcrumbQueryRow>(
            `
            select 
                c.id as category_id,
                c.name_en as category_name_en,
                c.name_ga as category_name_ga,
                s.id as sub_id,
                s.title_en as sub_name_en,
                s.title_ga as sub_name_ga
            from subcategories s 
            join categories c on c.id = s.category_id
            where s.id = $1
          `,
            [subcategoryId],
          );

        const breadcrumbs: Lang<Breadcrumb>[] = [
          {
            en: { href: "/en", label: "Home" },
            ga: { href: "/ga", label: "Abhaile" },
          },
        ];

        const row = queryResult.rows.at(0);
        if (row) {
          const cat: Lang<Breadcrumb> = {
            en: {
              href: "", // `/en/categories/${row.category_id}`,
              label: row.category_name_en,
            },
            ga: {
              href: "", // `/ga/categories/${row.category_id}`,
              label: row.category_name_ga,
            },
          };
          const subcat: Lang<Breadcrumb> = {
            en: {
              href: `/en/subcategories/${row.sub_id}`,
              label: row.sub_name_en,
            },
            ga: {
              href: `/ga/subcategories/${row.sub_id}`,
              label: row.sub_name_ga,
            },
          };
          breadcrumbs.push(cat, subcat);
        }

        return breadcrumbs;
      } catch (err) {
        console.log(err);
        throw new Error("breadcrumbs_failed");
      }
    },
    async formData(subcategoryId: string): Promise<SubcategoryModel> {
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
            i.title_ga as item_title_ga
        from subcategories s
        join categories c on c.id = s.category_id
        left join subcategory_items i on i.subcategory_id = s.id
        where s.id = $1
        order by i.created_at
        `,
        [subcategoryId],
      );

      let subcategoryModel: SubcategoryModel | undefined;

      for (const row of queryResult.rows) {
        const items = row.item_id
          ? [
              {
                id: row.item_id,
                title: {
                  en: row.item_title_en,
                  ga: row.item_title_ga,
                },
              },
            ]
          : [];
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
    async create(
      categoryId: string,
      subcategory: Omit<SubcategoryModel, "items" | "id">,
    ): Promise<string> {
      try {
        const insertQueryResult = await lifeEventsPool.query<{ id: string }>(
          `
            insert into subcategories(
              category_id,
              title_en,
              title_ga,
              text_en,
              text_ga
            ) values($1,$2,$3,$4,$5)
             returning id
          `,
          [
            categoryId,
            subcategory.title.en,
            subcategory.title.ga || "",
            subcategory.text.en || "",
            subcategory.text.ga || "",
          ],
        );

        const subcategoryId = insertQueryResult.rows.at(0)?.id;
        if (!subcategoryId) {
          throw new Error();
        }

        return subcategoryId;
      } catch (err) {
        console.log(err);
        throw new Error("create_fail");
      }
    },
  },
  subcategoryItem: {
    async breadcrumbs(itemId: string): Promise<Lang<Breadcrumb>[]> {
      try {
        const queryResult =
          await lifeEventsPool.query<SubcategoryItemBreadcrumbQueryRow>(
            `
              select 
                i.id as item_id,
                i.title_en as item_name_en,
                i.title_ga as item_name_ga,
                c.id as category_id,
                c.name_en as category_name_en,
                c.name_ga as category_name_ga,
                s.id as sub_id,
                s.title_en as sub_name_en,
                s.title_ga as sub_name_ga
              from subcategory_items i
              join subcategories s on s.id = i.subcategory_id
              join categories c on c.id = s.category_id
              where i.id = $1
            `,
            [itemId],
          );

        const breadcrumbs: Lang<Breadcrumb>[] = [
          {
            en: { href: "/en", label: "Home" },
            ga: { href: "/ga", label: "Abhaile" },
          },
        ];

        const row = queryResult.rows.at(0);
        console.log(row);
        if (row) {
          const cat: Lang<Breadcrumb> = {
            en: {
              href: "", //`/en/categories/${row.category_id}`,
              label: row.category_name_en,
            },
            ga: {
              href: "", // `/ga/categories/${row.category_id}`,
              label: row.category_name_ga,
            },
          };
          const subcat: Lang<Breadcrumb> = {
            en: {
              href: `/en/subcategories/${row.sub_id}`,
              label: row.sub_name_en,
            },
            ga: {
              href: `/ga/subcategories/${row.sub_id}`,
              label: row.sub_name_ga,
            },
          };
          const item: Lang<Breadcrumb> = {
            en: {
              href: `/en/subcategory-item/${row.item_id}`,
              label: row.item_name_en,
            },
            ga: {
              href: `/ga/subcategories/${row.item_id}`,
              label: row.item_name_ga,
            },
          };
          breadcrumbs.push(cat, subcat, item);
        }

        return breadcrumbs;

        return [];
      } catch (err) {
        console.log(err);
        throw new Error("breadcrumbs_failed");
      }
    },
    async formData(itemId: string): Promise<SubcategoryItemModel> {
      try {
        const queryResult = await lifeEventsPool.query<SubcategoryItemQueryRow>(
          `
            select 
              id as item_id,
              subcategory_id as sub_id,
              title_en as item_title_en,
              title_ga as item_title_ga,
              text_en as item_text_en,
              text_ga as item_text_ga,
              links as item_links
            from subcategory_items
            where id = $1
          `,
          [itemId],
        );

        const row = queryResult.rows.at(0);
        if (!row) {
          throw new Error();
        }

        return {
          id: row.item_id,
          subcategoryId: row.sub_id,
          links: [
            {
              href: row.item_links?.[0]?.href || "",
              isExternal: Boolean(row.item_links?.[0]?.isExternal),
              name: {
                en: row.item_links?.[0]?.name_en,
                ga: row.item_links?.[0]?.name_ga,
              },
            },
            {
              href: row.item_links?.[1]?.href || "",
              isExternal: Boolean(row.item_links?.[1]?.isExternal),
              name: {
                en: row.item_links?.[1]?.name_en,
                ga: row.item_links?.[1]?.name_ga,
              },
            },
            {
              href: row.item_links?.[2]?.href || "",
              isExternal: Boolean(row.item_links?.[2]?.isExternal),
              name: {
                en: row.item_links?.[2]?.name_en,
                ga: row.item_links?.[2]?.name_ga,
              },
            },
          ],
          text: {
            en: row.item_text_en,
            ga: row.item_text_ga,
          },
          title: {
            en: row.item_title_en,
            ga: row.item_title_ga,
          },
        };
      } catch (err) {
        console.log(err);
        throw new Error("formData_failed");
      }
    },
    async update(
      item: Omit<SubcategoryItemModel, "subcategoryId">,
    ): Promise<void> {
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
    async create(
      subcategoryId: string,
      item: Omit<SubcategoryItemModel, "id" | "subcategoryId">,
    ): Promise<string> {
      try {
        const createQueryResult = await lifeEventsPool.query<{ id: string }>(
          `
            insert into subcategory_items(
                subcategory_id,
                title_en,
                title_ga,
                text_en,
                text_ga,
                links
            ) values (
                $1,$2,$3,$4,$5,$6
            )
            returning id
          `,
          [
            subcategoryId,
            item.title.en,
            item.title.ga || "",
            item.text.en,
            item.text.ga || "",
            JSON.stringify(
              item.links.map((item) => ({
                href: item.href,
                isExternal: item.isExternal,
                name_en: item.name.en,
                name_ga: item.name.ga || "",
              })),
            ),
          ],
        );

        return createQueryResult.rows.at(0)!.id;
      } catch (err) {
        console.log(err);
        throw new Error("create_fail");
      }
    },
    async delete(itemId: string): Promise<void> {
      try {
        await lifeEventsPool.query(
          `
            delete from subcategory_items
            where id = $1
            `,
          [itemId],
        );
      } catch (err) {
        console.log(err);
        throw new Error("delete_fail");
      }
    },
  },
};
