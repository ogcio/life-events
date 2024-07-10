import { getTranslations } from "next-intl/server";
import ds from "design-system";
import submitQuery_ from "./actions/submitQuery";
import { headers } from "next/headers";

const Icon = ds.Icon;

type SearchFormProps = {
  searchParams: URLSearchParams;
};

export default async ({ searchParams }: SearchFormProps) => {
  const t = await getTranslations("Timeline");

  const path = headers().get("x-pathname")?.toString();
  const submitQuery = submitQuery_.bind(null, path, searchParams);

  const searchQuery = searchParams.get("searchQuery") || "";

  return (
    <form action={submitQuery}>
      <div className="govie-input__wrapper">
        <input
          type="text"
          id="search-query"
          name="search-query"
          className="govie-input"
          placeholder={t("searchEvent")}
          defaultValue={searchQuery}
        />
        {/* allows submit via enter key */}
        <input type="submit" hidden />

        <button
          type="submit"
          className="govie-input__suffix"
          style={{ cursor: "pointer" }}
          aria-label={t("search")}
        >
          <Icon icon={"search"} color={ds.colours.ogcio.darkGreen} />
        </button>
      </div>
    </form>
  );
};
