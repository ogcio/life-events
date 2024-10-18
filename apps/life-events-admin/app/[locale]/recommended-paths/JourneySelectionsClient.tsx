"use client";
import { Heading } from "@govie-ds/react";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

type PropOption = {
  category: {
    selectedValue?: string;
    options: { value: string; label: string }[];
  };
  subcategory: {
    selectedValue?: string;
    options: { value: string; label: string }[];
  };
  subcategoryItem: {
    selectedValue?: string;
    options: { value: string; label: string }[];
  };
};

export default function SelectionForm(props: {
  pathId?: string;
  from: PropOption;
  to: PropOption;
  lang: string;
  formAction: (formData: FormData) => Promise<void>;
}) {
  const tTable = useTranslations("Table");
  const tForm = useTranslations("Form");

  const { replace, refresh } = useRouter();
  const searchParams = useSearchParams();

  const handleFromCategorySelect = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    params.set("fcid", e.target.value);
    params.delete("fsid");
    params.delete("fiid");

    replace("?" + params.toString());
    refresh();
  };

  const handleFromSubcategorySelect = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    params.set("fsid", e.target.value);

    replace("?" + params.toString());
    refresh();
  };

  const handleFromSubcategoryItemSelect = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    params.set("fiid", e.target.value);

    replace("?" + params.toString());
    refresh();
  };

  const handleToCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    params.set("tcid", e.target.value);
    params.delete("tsid");
    params.delete("tiid");

    replace("?" + params.toString());
    refresh();
  };

  const handleToSubcategorySelect = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    params.set("tsid", e.target.value);
    params.delete("tiid");
    replace("?" + params.toString());
    refresh();
  };

  const handleToSubcategoryItemSelect = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    params.set("tiid", e.target.value);

    replace("?" + params.toString());
    refresh();
  };

  return (
    <section>
      <Heading as="h2">{tTable("from")}</Heading>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <label className="govie-label govie-label--s" htmlFor="category">
            {tTable("category")}
          </label>
          <select
            className="govie-select"
            id="category"
            name="category"
            defaultValue={props.from.category.selectedValue}
            onChange={handleFromCategorySelect}
          >
            <option>{tForm("selectCategory")}</option>
            {props.from.category.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="govie-label govie-label--s" htmlFor="subcategory">
            {tTable("subcategory")}
          </label>
          <select
            className="govie-select"
            id="subcategory"
            name="subcategory"
            defaultValue={props.from.subcategory.selectedValue}
            onChange={handleFromSubcategorySelect}
          >
            <option>{tForm("selectSubcategory")}</option>
            {props.from.subcategory.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="govie-label govie-label--s" htmlFor="items">
            {tForm("itemLabel")}
          </label>
          <select
            className="govie-select"
            id="items"
            name="items"
            defaultValue={props.from.subcategoryItem.selectedValue}
            onChange={handleFromSubcategoryItemSelect}
          >
            <option>{tForm("selectItem")}</option>
            {props.from.subcategoryItem.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Heading as="h2">{tTable("to")}</Heading>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <label className="govie-label govie-label--s" htmlFor="category">
            {tTable("category")}
          </label>
          <select
            className="govie-select"
            id="category"
            name="category"
            defaultValue={props.to.category.selectedValue}
            onChange={handleToCategorySelect}
          >
            <option>{tForm("selectCategory")}</option>
            {props.to.category.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="govie-label govie-label--s" htmlFor="subcategory">
            {tTable("subcategory")}
          </label>
          <select
            className="govie-select"
            id="subcategory"
            name="subcategory"
            defaultValue={props.to.subcategory.selectedValue}
            onChange={handleToSubcategorySelect}
          >
            <option>{tForm("selectSubcategory")}</option>
            {props.to.subcategory.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="govie-label govie-label--s" htmlFor="items">
            {tForm("itemLabel")}
          </label>
          <select
            className="govie-select"
            id="items"
            name="items"
            defaultValue={props.to.subcategoryItem.selectedValue}
            onChange={handleToSubcategoryItemSelect}
          >
            <option>{tForm("selectItem")}</option>
            {props.to.subcategoryItem.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {props.pathId ? (
        <button
          disabled={
            !props.from.subcategoryItem.selectedValue ||
            !props.to.subcategoryItem.selectedValue
          }
          className="govie-button"
          onClick={() => {
            const formData = new FormData();

            formData.append("pathId", props.pathId!);
            formData.append(
              "fromSubcategoryItemId",
              props.from.subcategoryItem.selectedValue!,
            );
            formData.append(
              "toSubcategoryItemId",
              props.to.subcategoryItem.selectedValue!,
            );

            props.formAction(formData);
          }}
        >
          {tForm("update")}
        </button>
      ) : (
        <button
          disabled={
            !props.from.subcategoryItem.selectedValue ||
            !props.to.subcategoryItem.selectedValue
          }
          className="govie-button"
          onClick={() => {
            const formData = new FormData();
            formData.append(
              "fromSubcategoryItemId",
              props.from.subcategoryItem.selectedValue!,
            );
            formData.append(
              "toSubcategoryItemId",
              props.to.subcategoryItem.selectedValue!,
            );

            props.formAction(formData);
          }}
        >
          {tForm("create")}
        </button>
      )}
    </section>
  );
}
