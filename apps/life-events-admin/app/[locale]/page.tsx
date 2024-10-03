import React from "react";
import { Heading } from "@govie-ds/react";
import { AuthenticationFactory } from "../../utils/authentication-factory";
import { LANG_EN, LANG_GA } from "../../utils/locale";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CategoryListModel, data } from "../../data/data";

function Menu(props: { categories: CategoryListModel[]; locale: string }) {
  return (
    <ul>
      {props.categories.map((category) => {
        return (
          <li key={category.id}>
            <Link href={`/categories/${category.id}`}>
              {category.name[props.locale] || category.name.en}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default async (props: { params: { locale: string } }) => {
  const { user } = await AuthenticationFactory.getInstance().getContext();

  const categories = await data.getCategories();

  return (
    <>
      <Heading>
        We're in {user.name} from{" "}
        {Object.keys(user.organizationData ?? {}).at(0)}!
      </Heading>

      <Menu categories={categories} locale={props.params.locale} />
    </>
  );
};
