type Props = {
  params: {
    locale: string;
  };
};

export default async (props: Props) => {
  const path = `${props.params.locale}/`;

  return (
    <section>
      <h3 className="govie-heading-l">welcome to upload app</h3>
    </section>
  );
};
