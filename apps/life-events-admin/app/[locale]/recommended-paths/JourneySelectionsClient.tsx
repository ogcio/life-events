"use client";
import { Heading } from "@govie-ds/react";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
  const { replace, refresh, push } = useRouter();
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
    <>
      <section>
        <Heading as="h2">From</Heading>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <label className="govie-label govie-label--s" htmlFor="category">
              Category
            </label>
            <select
              className="govie-select"
              id="category"
              name="category"
              defaultValue={props.from.category.selectedValue}
              onChange={handleFromCategorySelect}
            >
              <option>Select a category</option>
              {props.from.category.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="govie-label govie-label--s" htmlFor="subcategory">
              Subcategory
            </label>
            <select
              className="govie-select"
              id="subcategory"
              name="subcategory"
              defaultValue={props.from.subcategory.selectedValue}
              onChange={handleFromSubcategorySelect}
            >
              <option>Select a subcategory</option>
              {props.from.subcategory.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="govie-label govie-label--s" htmlFor="items">
              Item
            </label>
            <select
              className="govie-select"
              id="items"
              name="items"
              defaultValue={props.from.subcategoryItem.selectedValue}
              onChange={handleFromSubcategoryItemSelect}
            >
              <option>Select an item</option>
              {props.from.subcategoryItem.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Heading as="h2">To</Heading>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <label className="govie-label govie-label--s" htmlFor="category">
              Category
            </label>
            <select
              className="govie-select"
              id="category"
              name="category"
              defaultValue={props.to.category.selectedValue}
              onChange={handleToCategorySelect}
            >
              <option>Select a category</option>
              {props.to.category.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="govie-label govie-label--s" htmlFor="subcategory">
              Subcategory
            </label>
            <select
              className="govie-select"
              id="subcategory"
              name="subcategory"
              defaultValue={props.to.subcategory.selectedValue}
              onChange={handleToSubcategorySelect}
            >
              <option>Select a subcategory</option>
              {props.to.subcategory.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="govie-label govie-label--s" htmlFor="items">
              Item
            </label>
            <select
              className="govie-select"
              id="items"
              name="items"
              defaultValue={props.to.subcategoryItem.selectedValue}
              onChange={handleToSubcategoryItemSelect}
            >
              <option>Select an item</option>
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
            Update
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
            Create
          </button>
        )}
      </section>
    </>
  );
}
