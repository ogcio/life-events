import React from "react";
import "./page.css";
import PageMenu, { PageMenuItem } from "./PageMenu";
import { data } from "../../../data/data";
import { Heading, Label, Paragraph } from "@govie-ds/react";
import { translate } from "../../../utils/locale";
import { ItemContainer } from "./SubcategoryItemContainer";
import { Links } from "./Links";
import { AuthenticationFactory } from "../../../utils/authentication-factory";
import { getTranslations } from "next-intl/server";
import Search from "./Search";
import MyDashboard from "./MyDashboard";

export default async function RootPage(props: {
  params: { locale: string; slug: string };
  searchParams?: { search?: string };
}) {
  const [tSub, tHome] = await Promise.all([
    getTranslations("Subcategories"),
    getTranslations("Home"),
  ]);
  const categoryItems = await data.category.menu();
  const { name, id } = await AuthenticationFactory.getInstance().getUser();

  let title = { en: "", ga: "" };
  let categoryData:
    | Awaited<ReturnType<typeof data.subcategory.mainList>>["subcategories"]
    | undefined;

  try {
    const mainListQuery = await data.subcategory.mainList(
      props.params.slug,
      props.searchParams?.search,
    );

    if (mainListQuery) {
      categoryData = mainListQuery.subcategories;
      title = mainListQuery.categoryName;
    }
  } catch (err) {
    console.log(err);
  }

  return (
    <div className="main-content-container">
      <PageMenu
        userName={name || "User"}
        topItems={[
          <PageMenuItem
            key="my-dashboard"
            href="/"
            icon="space_dashboard"
            isSelected={props.params.slug === "my-dashboard"}
          >
            {tHome("myDashboard")}
          </PageMenuItem>,
          <PageMenuItem
            key="messaging"
            href="/"
            icon="mail"
            isSelected={props.params.slug === "messaging"}
          >
            {tHome("messaging")}
          </PageMenuItem>,
          <PageMenuItem
            key="about-me"
            href="/"
            icon="person"
            isSelected={props.params.slug === "about-me"}
          >
            {tHome("aboutMe")}
          </PageMenuItem>,
        ]}
        bottomItems={categoryItems.map((cat) => (
          <PageMenuItem
            key={`menu_${cat.id}`}
            href={`/${props.params.locale}/${cat.slug.en}`}
            icon={cat.icon}
            isSelected={cat.slug.en === props.params.slug}
          >
            {translate(cat.name, props.params.locale)}
          </PageMenuItem>
        ))}
      ></PageMenu>
      {props.params.slug === "my-dashboard" ? (
        <MyDashboard locale={props.params.locale} userId={id} />
      ) : (
        <section style={{ minWidth: "360px", width: "100%" }}>
          <Heading>{translate(title, props.params.locale)}</Heading>

          <Search
            default={props.searchParams?.search || ""}
            placeholder={`${tSub("searchPlaceholderPrefix")} ${translate(title, props.params.locale)}`}
          />

          {categoryData?.length ? (
            categoryData.map((subcategory) => {
              return (
                <div
                  style={{ paddingBottom: "24px" }}
                  key={subcategory.subcategoryId}
                >
                  <Heading as="h2">
                    {translate(
                      subcategory.subcategoryCopy,
                      props.params.locale,
                      "title",
                    )}
                  </Heading>
                  <Paragraph>
                    {translate(
                      subcategory.subcategoryCopy,
                      props.params.locale,
                      "text",
                    )}
                  </Paragraph>
                  <ItemContainer>
                    {subcategory.items.map((item) => {
                      return (
                        <div
                          key={`sc_${item.id}`}
                          style={{
                            minWidth: "380px",
                            flex: "1",
                          }}
                        >
                          <Label
                            style={{ fontWeight: 600 }}
                            text={translate(
                              item.copy,
                              props.params.locale,
                              "title",
                            )}
                          />
                          <Paragraph
                            style={{
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              margin: "0 0 12px 0",
                            }}
                          >
                            {translate(item.copy, props.params.locale, "text")}
                          </Paragraph>

                          <Links
                            itemId={item.id}
                            links={item.links}
                            locale={props.params.locale}
                            userId={id}
                          />
                        </div>
                      );
                    })}
                  </ItemContainer>
                  <hr />
                </div>
              );
            })
          ) : (
            <Paragraph>{tSub("noItems")}</Paragraph>
          )}
        </section>
      )}
    </div>
  );
}
