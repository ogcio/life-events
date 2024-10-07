import React from "react";
import {
  Heading,
  TextInput,
  Label,
  LabelSize,
  Paragraph,
} from "@govie-ds/react";
import { data } from "../../../../data/data";
import { translate } from "../../../../utils/locale";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async (props: {
  params: { locale: string; id: string };
  searchParams: { did: string };
}) => {
  const tSubcat = await getTranslations("Subcategory");
  let formData: Awaited<ReturnType<typeof data.subcategory.formData>>;
  try {
    formData = await data.subcategory.formData(props.params.id);
  } catch (err) {
    console.log(err);
    return <>Not found</>;
  }

  async function subcategoryFormAction(formData: FormData) {
    "use server";

    const textEn = formData.get("text_en")?.toString() || "";
    const textGa = formData.get("text_ga")?.toString() || "";
    const titleEn = formData.get("title_en")?.toString() || "";
    const titleGa = formData.get("title_ga")?.toString() || "";

    await data.subcategory.update({
      id: props.params.id,
      text: {
        en: textEn,
        ga: textGa,
      },
      title: {
        en: titleEn,
        ga: titleGa,
      },
    });
    revalidatePath("/");
  }

  async function itemFormAction(formData: FormData) {
    "use server";

    const itemId = formData.get("id")?.toString() || "";
    if (!itemId) {
      return;
    }

    const titleEn = formData.get("title_en")?.toString() || "";
    const titleGa = formData.get("title_ga")?.toString() || "";
    const textEn = formData.get("text_en")?.toString() || "";
    const textGa = formData.get("text_ga")?.toString() || "";
    const link1nameEn = formData.get("0_link_name_en")?.toString() || "";
    const link1nameGa = formData.get("0_link_name_ga")?.toString() || "";
    const link1href = formData.get("0_link_href")?.toString() || "";
    const link1external = Boolean(formData.get("0_link_isExternal"));

    const link2nameEn = formData.get("1_link_name_en")?.toString() || "";
    const link2nameGa = formData.get("1_link_name_ga")?.toString() || "";
    const link2href = formData.get("1_link_href")?.toString() || "";
    const link2external = Boolean(formData.get("1_link_isExternal"));

    const link3nameEn = formData.get("2_link_name_en")?.toString() || "";
    const link3nameGa = formData.get("2_link_name_ga")?.toString() || "";
    const link3href = formData.get("2_link_href")?.toString() || "";
    const link3external = Boolean(formData.get("2_link_isExternal"));

    await data.subcategoryItem.update({
      id: itemId,
      links: [
        {
          href: link1href,
          isExternal: link1external,
          name: {
            en: link1nameEn,
            ga: link1nameGa,
          },
        },
        {
          href: link2href,
          isExternal: link2external,
          name: {
            en: link2nameEn,
            ga: link2nameGa,
          },
        },
        {
          href: link3href,
          isExternal: link3external,
          name: {
            en: link3nameEn,
            ga: link3nameGa,
          },
        },
      ],
      text: {
        en: textEn,
        ga: textGa,
      },
      title: {
        en: titleEn,
        ga: titleGa,
      },
    });
  }

  async function newItemAction() {
    "use server";

    redirect(
      `/${props.params.locale}/subcategories/${props.params.id}/create-item`,
    );
  }

  async function deleteItemAction(formData: FormData) {
    "use server";

    const itemId = formData.get("id")?.toString();
    if (!itemId) {
      return;
    }

    await data.subcategoryItem.delete(itemId);

    redirect(`/${props.params.locale}/subcategories/${props.params.id}`);
  }

  const itemToBeDeleted = formData.items.find(
    (item) => item.id === props.searchParams.did,
  );

  return (
    <>
      {itemToBeDeleted && (
        <div className="govie-modal">
          <div className="govie-modal--overlay"></div>
          <div
            className="govie-modal--content"
            style={{ position: "fixed", top: "20%" }}
          >
            <div
              className="govie-modal--close-button-container"
              style={{ padding: "10px" }}
            >
              <a
                href={`/${props.params.locale}/subcategories/${props.params.id}`}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"
                    fill="#505A5F"
                  ></path>
                </svg>
                <span className="govie-visually-hidden">
                  {tSubcat("close")}
                </span>
              </a>
              <span className="govie-tooltip govie-tooltip--undefined">
                {tSubcat("close")}
              </span>
            </div>
            <h1 className="govie-heading-s">
              {tSubcat("confirmDeletionTitle")}
            </h1>
            <p className="govie-body">
              {tSubcat("modalDeleteP1")}&nbsp;
              <b>{translate(itemToBeDeleted.title, props.params.locale)}</b>
            </p>
            <p className="govie-body">{tSubcat("modalDeleteP2")}</p>
            <div className="govie-modal--buttons">
              <a
                style={{ width: "fit-content" }}
                href={`/${props.params.locale}/subcategories/${props.params.id}`}
                className="govie-button govie-button--medium govie-button--outlined"
              >
                {tSubcat("modalCancel")}
              </a>
              <form action={deleteItemAction} style={{ minWidth: "45%" }}>
                <input
                  name="id"
                  defaultValue={itemToBeDeleted.id}
                  type="hidden"
                ></input>
                <button className="govie-button govie-button--medium ">
                  {tSubcat("deleteConfirm")}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      <a className="govie-back-link" href="/">
        {tSubcat("back")}
      </a>
      <ul className="govie-list">
        {formData.items.map((item) => (
          <li key={`scrollList_${item.id}`}>
            <a
              className="govie-link govie-link--no-visited-state"
              href={`#${item.id}`}
            >
              {translate(item.title, props.params.locale)}
            </a>
          </li>
        ))}
      </ul>
      <form action={newItemAction}>
        <button className="govie-button govie-button" type="submit">
          {tSubcat("addNewItem")}
        </button>
      </form>
      <Heading>{translate(formData.title, props.params.locale)}</Heading>
      <form action={subcategoryFormAction}>
        <fieldset
          style={{
            padding: "10px",
            border: "1px solid gray",
            borderRadius: "2px",
            marginBottom: "50px",
          }}
        >
          <legend style={{ fontSize: "18px", fontWeight: 600 }}>
            {tSubcat("title")}
          </legend>

          {Object.keys(formData.title).map((langKey) => (
            <TextInput
              key={`title_${langKey}`}
              defaultValue={translate(formData.title, langKey)}
              label={{ text: tSubcat(langKey) }}
              name={`title_${langKey}`}
            ></TextInput>
          ))}
          <button
            style={{ margin: "unset" }}
            className="govie-button govie-button--medium"
            type="submit"
          >
            {tSubcat("save")}
          </button>
        </fieldset>

        <fieldset
          style={{
            padding: "10px",
            border: "1px solid gray",
            borderRadius: "2px",
            marginBottom: "50px",
          }}
        >
          <legend style={{ fontSize: "18px", fontWeight: 600 }}>
            {tSubcat("text")}
          </legend>
          {!formData.text.en && (
            <Label
              text={tSubcat("emptyDisclaimer")}
              size={LabelSize.sm}
            ></Label>
          )}

          {Object.keys(formData.title).map((langKey) => (
            <TextInput
              key={`desc_${langKey}`}
              defaultValue={translate(formData.text, langKey)}
              label={{ text: tSubcat(langKey) }}
              name={`text_${langKey}`}
            ></TextInput>
          ))}

          <button
            style={{ margin: "unset" }}
            className="govie-button govie-button--medium"
            type="submit"
          >
            {tSubcat("save")}
          </button>
        </fieldset>
      </form>
      {formData.items.map((item) => {
        return (
          <React.Fragment key={item.id}>
            <hr
              id={item.id}
              className="govie-section-break govie-section-break--visible"
            ></hr>

            <details name="bror" style={{ padding: "10px" }}>
              <summary
                id="1"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Paragraph style={{ margin: "unset" }}>
                  {translate(item.title, props.params.locale)}
                </Paragraph>

                {/* <form action={openDeleteModalAction}> */}
                <input type="hidden" name="id" defaultValue={item.id} />
                <Link
                  href={`/${props.params.locale}/subcategories/${props.params.id}?did=${item.id}`}
                  style={{ margin: "unset" }}
                  //   className="govie-button govie-button--medium"
                  className="govie-link"
                >
                  {tSubcat("delete")}
                </Link>
                {/* </form> */}
              </summary>
              <form action={itemFormAction}>
                <input name="id" type="hidden" readOnly value={item.id}></input>
                <fieldset
                  style={{
                    padding: "10px",
                    border: "1px solid gray",
                    borderRadius: "2px",
                    margin: "0px 0px 50px 0px",
                  }}
                >
                  <legend style={{ fontSize: "18px", fontWeight: 600 }}>
                    {tSubcat("title")}
                  </legend>
                  {Object.keys(formData.title).map((langKey) => (
                    <TextInput
                      key={`${item.id}_title_${langKey}`}
                      defaultValue={translate(item.title, langKey)}
                      label={{ text: tSubcat(langKey) }}
                      name={`title_${langKey}`}
                    ></TextInput>
                  ))}
                  <button
                    style={{ margin: "unset" }}
                    className="govie-button govie-button--medium"
                    type="submit"
                  >
                    {tSubcat("save")}
                  </button>
                </fieldset>

                <fieldset
                  style={{
                    padding: "10px",
                    border: "1px solid gray",
                    borderRadius: "2px",
                    margin: "0px 0px 50px 0px",
                  }}
                >
                  <legend style={{ fontSize: "18px", fontWeight: 600 }}>
                    {tSubcat("text")}
                  </legend>
                  {Object.keys(formData.text).map((langKey) => (
                    <TextInput
                      key={`${item.id}_text_${langKey}`}
                      defaultValue={translate(item.text, langKey)}
                      label={{ text: tSubcat(langKey) }}
                      name={`text_${langKey}`}
                    ></TextInput>
                  ))}

                  <button
                    style={{ margin: "unset" }}
                    className="govie-button govie-button--medium"
                    type="submit"
                  >
                    {tSubcat("save")}
                  </button>
                </fieldset>

                {item.links.map((link, i) => (
                  <fieldset
                    key={`${item.id}_link_${i}}`}
                    style={{
                      padding: "10px",
                      border: "1px solid gray",
                      borderRadius: "2px",
                      margin: "0px 0px 50px 0px",
                    }}
                  >
                    <legend style={{ fontSize: "18px", fontWeight: 600 }}>
                      {tSubcat(i === 0 ? "link1" : i === 1 ? "link2" : "link3")}
                    </legend>
                    {Object.keys(link.name).map((langKey) => (
                      <TextInput
                        key={`link_${langKey}`}
                        defaultValue={translate(link.name, langKey)}
                        label={{ text: tSubcat(langKey) }}
                        name={`${i}_link_name_${langKey}`}
                      ></TextInput>
                    ))}
                    <TextInput
                      defaultValue={link.href}
                      label={{ text: tSubcat("href") }}
                      name={`${i}_link_href`}
                    ></TextInput>
                    <div className="govie-form-group">
                      <fieldset className="govie-fieldset">
                        <div className="govie-checkboxes govie-checkboxes--small">
                          <div className="govie-checkboxes__item">
                            <input
                              className="govie-checkboxes__input"
                              id={`${i}_${item.id}`}
                              name={`${i}_link_isExternal`}
                              type="checkbox"
                              defaultChecked={link.isExternal}
                              value="ext"
                            />
                            <label
                              htmlFor={`${i}_${item.id}`}
                              className="govie-label govie-checkboxes__label"
                            >
                              {tSubcat("isExternal")}
                            </label>
                          </div>
                        </div>
                      </fieldset>
                    </div>

                    <button
                      style={{ margin: "unset" }}
                      className="govie-button govie-button--medium"
                      type="submit"
                    >
                      {tSubcat("save")}
                    </button>
                  </fieldset>
                ))}
              </form>
            </details>
          </React.Fragment>
        );
      })}
    </>
  );
};
