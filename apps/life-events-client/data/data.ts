import { lifeEventsPool } from "./postgres";

export type Lang<T> = {
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

export type Link = { href: string; name: Lang<string>; isExternal: boolean };
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

type CategoryMenuModel = {
  name: Lang<string>;
  slug: Lang<string>;
  icon: string;
  id: string;
};

type CategoryMenuQueryRow = {
  name_en: string;
  name_ga: string;
  slug_en: string;
  icon: string;
  id: string;
};

type SubcategoryMainListQueryRow = {
  cat_name_en: string;
  cat_name_ga: string;
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
  links: {
    href: string;
    isExternal: boolean;
    name_ga: string;
    name_en: string;
  }[];
};
type SubcategoryMainListModel = {
  subcategoryId: string;
  subcategoryCopy: Lang<{ title: string; text: string }>;
  items: {
    id: string;
    copy: Lang<{ title: string; text: string }>;
    links: Link[];
  }[];
};

type ItemSubmittedJourneyQueryRow = {
  item_id: string;
  title_en: string;
  title_ga: string;
  status: string;
  at: string;
};

type ItemSubmittedJourneyModel = {
  itemId: string;
  title: Lang<string>;
  status: string;
  at: string;
};

type HighlightedJourneyQueryRow = {
  item_id: string;
  item_title_en: string;
  item_title_ga: string;
  item_text_en: string;
  item_text_ga: string;
};

type HighlightedJourneyModel = {
  itemId: string;
  copy: Lang<{ title: string; text: string }>;
};

export const data = {
  category: {
    async menu(): Promise<CategoryMenuModel[]> {
      try {
        const queryResult = await lifeEventsPool.query<CategoryMenuQueryRow>(`
            select 
              name_en,
              name_ga,
              slug_en,
              icon,
              id
            from categories
            order by sort_order
          `);

        return queryResult.rows.map((row) => ({
          id: row.id,
          name: {
            en: row.name_en,
            ga: row.name_ga,
          },
          slug: {
            en: row.slug_en,
            ga: row.slug_en,
          },
          icon: row.icon,
        }));
      } catch (err) {
        console.log(err);
        throw new Error("menu_fail");
      }
    },
  },
  subcategory: {
    async mainList(
      slug: string,
      search?: string,
    ): Promise<{
      categoryName: Lang<string>;
      subcategories: SubcategoryMainListModel[];
    }> {
      try {
        const query = search ? `%${search}%` : null;
        const queryResult =
          await lifeEventsPool.query<SubcategoryMainListQueryRow>(
            `
            select 
              c.name_en as cat_name_en,
              c.name_ga as cat_name_ga,
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
              i.links as links
            from categories c
            left join subcategories s on c.id = s.category_id
            left join subcategory_items i on i.subcategory_id = s.id
            where c.slug_en = $1 
            and
              case when $2::text is not null then
                s.title_en ilike $2 
                or s.title_ga ilike $2
              else TRUE end
            order by s.sort_order
          `,
            [slug, query],
          );

        if (!queryResult.rows.length) {
          throw new Error();
        }

        const mainList: SubcategoryMainListModel[] = [];
        const catName = {
          en: queryResult.rows[0].cat_name_en,
          ga: queryResult.rows[0].cat_name_ga,
        };
        for (const row of queryResult.rows) {
          if (!row.sub_id) {
            continue;
          }
          let sub = mainList.find((item) => item.subcategoryId === row.sub_id);
          if (!sub) {
            sub = {
              subcategoryCopy: {
                en: { text: row.sub_text_en, title: row.sub_title_en },
                ga: { text: row.sub_text_ga, title: row.sub_title_ga },
              },
              subcategoryId: row.sub_id,
              items: [
                {
                  id: row.item_id,
                  links:
                    row.links.map((link) => ({
                      href: link.href,
                      isExternal: link.isExternal,
                      name: {
                        en: link.name_en,
                        ga: link.name_ga,
                      },
                    })) || [],
                  copy: {
                    en: {
                      text: row.item_text_en,
                      title: row.item_title_en,
                    },
                    ga: {
                      text: row.item_text_ga,
                      title: row.item_title_ga,
                    },
                  },
                },
              ],
            };
            mainList.push(sub);
            continue;
          }

          if (!sub.items.some((item) => item.id === row.item_id)) {
            sub.items.push({
              id: row.item_id,
              links:
                row.links.map((link) => ({
                  href: link.href,
                  isExternal: link.isExternal,
                  name: {
                    en: link.name_en,
                    ga: link.name_ga,
                  },
                })) || [],
              copy: {
                en: {
                  text: row.item_text_en,
                  title: row.item_title_en,
                },
                ga: {
                  text: row.item_text_ga,
                  title: row.item_title_ga,
                },
              },
            });
          }
        }

        return { subcategories: mainList, categoryName: catName };
      } catch (err) {
        console.log(err);
        throw new Error("mainList_fail");
      }
    },
  },
  subcategoryItem: {
    async completeJourney(itemId: string, userId: string): Promise<void> {
      try {
        await lifeEventsPool.query(
          `
            
            insert into user_journey_states(
            user_logto_id, subcategory_items_id, journey_status)
            values($1,$2,'completed')
            on conflict (user_logto_id, subcategory_items_id, journey_status)
            do nothing
          `,
          [userId, itemId],
        );
      } catch (err) {
        console.log(err);
        throw new Error("completeJourney_error");
      }
    },
    async submittedJourneys(
      userId: string,
    ): Promise<ItemSubmittedJourneyModel[]> {
      try {
        const queryResult =
          await lifeEventsPool.query<ItemSubmittedJourneyQueryRow>(
            `
            select
              i.id as item_id,
              i.title_en,
              i.title_ga,
              s.journey_status as status,
              s.created_at as at
            from subcategory_items i
            join user_journey_states s on s.subcategory_items_id = i.id
            where s.user_logto_id = $1
            order by s.created_at desc
            limit 3
            `,
            [userId],
          );

        return queryResult.rows.map((row) => ({
          at: row.at,
          itemId: row.item_id,
          status: row.status,
          title: {
            en: row.title_en,
            ga: row.title_ga,
          },
        }));
      } catch (err) {
        console.log(err);
        throw new Error("submittedJourneys_fail");
      }
    },
    async highlightedJourneys(
      userId: string,
    ): Promise<HighlightedJourneyModel[]> {
      try {
        const queryResult =
          await lifeEventsPool.query<HighlightedJourneyQueryRow>(
            `
          with x as (
            select 
              i.id as item_id,
              i.title_en as item_title_en,
              i.title_ga as item_title_ga,
              i.text_en as item_text_en,
              i.text_ga as item_text_ga
            from user_journey_states s
            join recommended_paths r on r.from_subcategory_item_id = s.subcategory_items_id
            join subcategory_items i on i.id = r.to_subcategory_item_id
            where s.user_logto_id = $1
            order by s.created_at
            limit 3
          ), rnd_remains as(
            select
              i.id as item_id,
              i.title_en as item_title_en,
              i.title_ga as item_title_ga,
              i.text_en as item_text_en,
              i.text_ga as item_text_ga
            from subcategory_items i
            where is_highlighted
            order by random()
            limit (3-(select count(*) from x))
          )
          select * from x
          union all
          select * from rnd_remains;
          `,
            [userId],
          );

        return queryResult.rows.map((row) => ({
          itemId: row.item_id,
          copy: {
            en: {
              text: row.item_text_en,
              title: row.item_title_en,
            },
            ga: {
              text: row.item_text_ga,
              title: row.item_title_ga,
            },
          },
        }));
      } catch (err) {
        console.log(err);
        throw new Error("highlightedJourneys_fail");
      }
    },
  },
  recommendedPaths: {},
};
