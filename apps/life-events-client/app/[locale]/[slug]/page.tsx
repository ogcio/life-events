import React from "react";
import "./page.css";
import PageMenu from "./PageMenu";
import { data } from "../../../data/data";
import { Heading, Label, Paragraph } from "@govie-ds/react";
import { translate } from "../../../utils/locale";
import { ItemContainer } from "./Subcategory";
import { Links } from "./Links";
import { AuthenticationFactory } from "../../../utils/authentication-factory";

export default async function RootPage(props: {
  params: { locale: string; slug: string };
}) {
  const categoryItems = await data.category.menu();
  const { name } = await AuthenticationFactory.getInstance().getUser();

  let title = { en: "", ga: "" };
  let categoryData:
    | Awaited<ReturnType<typeof data.subcategory.mainList>>["subcategories"]
    | undefined;

  try {
    const mainListQuery = await data.subcategory.mainList(props.params.slug);
    categoryData = mainListQuery.subcategories;
    title = mainListQuery.categoryName;
  } catch (err) {
    console.log(err);
  }

  return (
    <div className="main-content-container">
      <PageMenu
        userName={name || "User Name"}
        selectedSlug={props.params.slug}
        categoryItems={categoryItems}
        locale={props.params.locale}
      ></PageMenu>
      <section>
        <Heading>{translate(title, props.params.locale)}</Heading>
        <input type="search" placeholder="Search placeholder" />

        {categoryData &&
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
                      <div style={{ minWidth: "280px", flex: "1 1 auto" }}>
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
                          keyId={item.id}
                          links={item.links}
                          locale={props.params.locale}
                        />
                      </div>
                    );
                  })}
                </ItemContainer>
                <hr />
              </div>
            );
          })}
      </section>
    </div>
  );
}
