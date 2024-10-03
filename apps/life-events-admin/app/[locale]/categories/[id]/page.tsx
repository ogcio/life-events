import React from "react";
import {
  Container,
  Heading,
  IconButton,
  Label,
  TextInput,
} from "@govie-ds/react";
import { data } from "../../../../data/data";
import { translate } from "../../../../utils/locale";
import { getTranslations } from "next-intl/server";
export default async function Category(props: {
  params: { locale: string; id: string };
}) {
  const tCategory = await getTranslations("Category");
  let category: Awaited<ReturnType<typeof data.getCategory>> | undefined;
  try {
    category = await data.getCategory(props.params.id);
  } catch (err) {
    console.log(err);
    return <>Not found</>;
  }

  async function categoryFormAction(formData: FormData) {
    "use server";
    console.log(formData);
  }

  return (
    <>
      <Heading>
        {category.name[props.params.locale] || category.name.en}
      </Heading>

      {category.subcategories.map((subcat) => {
        return (
          <fieldset
            style={{
              padding: "10px",
              border: "1px solid gray",
              borderRadius: "2px",
            }}
          >
            <legend style={{ fontSize: "24px", fontWeight: 600 }}>
              {translate(subcat.title, props.params.locale)}
            </legend>
            <form
              action={categoryFormAction}
              name={subcat.id}
              key={subcat.title.en}
            >
              <Heading as="h3">{tCategory("title")}</Heading>
              {Object.keys(subcat.title).map((langKey) => {
                return (
                  <>
                    <TextInput
                      label={{
                        text: tCategory(langKey),
                      }}
                      defaultValue={translate(subcat.title, langKey)}
                    ></TextInput>
                  </>
                );
              })}

              <hr />

              <Heading as="h3">{tCategory("text")}</Heading>
              {Object.keys(subcat.text).map((langKey) => {
                return (
                  <>
                    <TextInput
                      label={{
                        text: tCategory(langKey),
                      }}
                      defaultValue={translate(subcat.text, langKey)}
                    ></TextInput>
                  </>
                );
              })}

              <hr />

              <Heading as="h3">Items?</Heading>
              {subcat.items.map((item) => {
                return (
                  <div
                    key={item.id}
                    style={{
                      padding: "10px",
                      border: "1px solid gray",
                      borderRadius: "2px",
                      margin: "10px 0",
                    }}
                  >
                    <Heading as="h3">{tCategory("title")}</Heading>
                    {Object.keys(item.title).map((langKey) => {
                      return (
                        <TextInput
                          lang={tCategory(langKey).toLowerCase()}
                          label={{ text: tCategory(langKey) }}
                          defaultValue={translate(item.title, langKey)}
                        />
                      );
                    })}

                    <hr />

                    <Heading as="h3">{tCategory("text")}</Heading>
                    {Object.keys(item.title).map((langKey) => {
                      return (
                        <TextInput
                          lang={tCategory(langKey).toLowerCase()}
                          label={{ text: tCategory(langKey) }}
                          defaultValue={translate(item.text, langKey)}
                        />
                      );
                    })}

                    <hr />
                    <Heading as="h3">{tCategory("links")}</Heading>
                    {item.links.map((link) => {
                      console.log(link);
                      return (
                        <div
                          key={link?.name.en}
                          style={{
                            margin: "15px",
                            padding: "15px",
                            background: "aliceblue",
                            border: "1px solid gray",
                          }}
                        >
                          <TextInput
                            label={{ text: tCategory("href") }}
                            defaultValue={link?.href || ""}
                          />
                          {Object.keys(link?.name || {}).map((langKey) => (
                            <TextInput
                              lang={tCategory(langKey).toLowerCase()}
                              label={{
                                text: tCategory(langKey),
                              }}
                              defaultValue={translate(link!.name, langKey)}
                            />
                          ))}
                          <TextInput
                            label={{ text: tCategory("isExternal") }}
                            defaultValue={String(link?.isExternal) || ""}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              <button className="govie-button">{tCategory("save")}</button>
            </form>
          </fieldset>
        );
      })}
    </>
  );
}
