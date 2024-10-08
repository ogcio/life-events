import React from "react";

export default async function Category(props: {
  params: { categoryId: string; locale: string };
}) {
  return (
    <>
      TODO {props.params.categoryId} {`[${props.params.locale}]`}
    </>
  );
}
