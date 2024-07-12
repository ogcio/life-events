import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { postgres, form } from "../../../../../utils";
import Link from "next/link";

type Props<TData> = {
  userId: string;
  flow: string;
  searchParams?: Record<string, string>;
  data: TData;
  slug: string;
  category: string;
  onSubmitRedirectSlug: string;
  showWarning: boolean;
  field: string;
  title?: string;
};

type FormProps<TData> = Omit<
  Props<TData>,
  "searchParams" | "showWarning" | "title"
> & {
  addressQuery: string;
  slug: string;
  category: string;
  onSubmitRedirectSlug: string;
};

const searchParamKeys = { address: "adr", formType: "t" };
async function SearchForm<TData>(props: FormProps<TData>) {
  const t = await getTranslations("AddressForm");
  const errorT = await getTranslations("formErrors");
  const errors = await form.getErrorsQuery(
    props.userId,
    props.slug,
    props.flow,
  );

  async function searchAction(formData: FormData) {
    "use server";

    const searchQuery = formData.get(props.field);

    if (!searchQuery?.toString().length) {
      await form.insertErrors(
        [
          {
            messageKey: form.errorTranslationKeys.empty,
            errorValue: "",
            field: form.fieldTranslationKeys.address,
          },
        ],
        props.userId,
        props.slug,
        props.flow,
      );
      return revalidatePath("/");
    }

    if (searchQuery) {
      redirect("?adr=" + searchQuery);
    }
  }

  const addressError = errors.rows.at(0);

  return (
    <form action={searchAction}>
      <div
        className={`govie-form-group ${
          addressError ? "govie-form-group--error" : ""
        }`.trim()}
      >
        <div className="govie-hint" id="input-field-hint">
          {t("searchHint")}
        </div>
        {addressError && (
          <p id="input-field-error" className="govie-error-message">
            <span className="govie-visually-hidden">Error:</span>
            {errorT(addressError.messageKey, {
              field: errorT("fields.address"),
              indArticleCheck: "an",
            })}
          </p>
        )}
        <input
          type="text"
          id={`${props.field}`}
          name={`${props.field}`}
          className="govie-input"
          aria-describedby="input-field-hint"
        />
      </div>
      <button className="govie-button">{t("findAddress")}</button>
    </form>
  );
}

async function SelectForm<TData>(props: FormProps<TData>) {
  const t = await getTranslations("AddressForm");
  const selectName = "selected-addr";
  async function submitAction(formData: FormData) {
    "use server";
    const selectedAddress = formData.get(selectName);

    if (!selectedAddress) {
      return;
    }

    // Store this in our currently added address (might wanna do this at the "verified" step)
    await postgres.pgpool.query(
      `
        INSERT INTO user_flow_data (flow, user_id, flow_data, category) 
        VALUES($1, $2, $3, $4)
        ON CONFLICT (flow, user_id) DO
        UPDATE SET flow_data = user_flow_data.flow_data || jsonb_build_object($5::TEXT, $6::TEXT, 'timeAtAddress','10 years'), updated_at = now()
        WHERE user_flow_data.user_id = $2 AND user_flow_data.flow = $1
    `,
      [
        props.flow,
        props.userId,
        JSON.stringify({
          ...props.data,
          [props.field]: selectedAddress,
          timeAtAddress: "5 months",
        }),
        props.category,
        props.field,
        selectedAddress,
      ],
    );

    redirect(props.onSubmitRedirectSlug);
  }

  const urlParams = new URLSearchParams({ q: props.addressQuery });

  const addressResponse = await fetch(
    `${process.env.API_ENDPOINT}/static/addresses/api?${urlParams}`,
  );
  const addresses = await addressResponse.json();

  const options = addresses.map((addr: string) => (
    <option key={addr}>{addr}</option>
  ));

  return (
    <>
      <form action={submitAction}>
        <div className="govie-form-group">
          <div className="govie-hint" id="input-field-hint">
            {t("selectHint")}
          </div>
          <select className="govie-select" id={selectName} name={selectName}>
            {options}
          </select>
        </div>
        <button className="govie-button">{t("continueWithAddress")}</button>
      </form>
      <Link className="govie-link" href={"?t=manual"}>
        {t("notListedTextLink")}
      </Link>
    </>
  );
}

async function ManualAddressForm<TData>(props: FormProps<TData>) {
  const t = await getTranslations("AddressForm");
  const errorT = await getTranslations("formErrors");
  const errors = await form.getErrorsQuery(
    props.userId,
    props.slug,
    props.flow,
  );

  async function submitAction(formData: FormData) {
    "use server";
    const errors: form.Error[] = [];
    const firstAddress = formData.get("addressFirst");
    const town = formData.get("town");
    const county = formData.get("county");
    const eirecode = formData.get("eirecode");

    if (!firstAddress?.toString().length) {
      errors.push({
        messageKey: form.errorTranslationKeys.empty,
        errorValue: "",
        field: form.fieldTranslationKeys.address,
      });
    }

    if (!town?.toString()) {
      errors.push({
        messageKey: form.errorTranslationKeys.empty,
        errorValue: "",
        field: form.fieldTranslationKeys.town,
      });
    }

    if (!county?.toString()) {
      errors.push({
        messageKey: form.errorTranslationKeys.empty,
        errorValue: "",
        field: form.fieldTranslationKeys.county,
      });
    }

    if (!eirecode?.toString()) {
      errors.push({
        messageKey: form.errorTranslationKeys.empty,
        errorValue: "",
        field: form.fieldTranslationKeys.eirecode,
      });
    }

    if (errors.length) {
      await form.insertErrors(errors, props.userId, props.slug, props.flow);
      return revalidatePath("/");
    }

    const fullAddressString = `${firstAddress} ${town} ${county} ${eirecode}`;

    await postgres.pgpool.query(
      `
        INSERT INTO user_flow_data (flow, user_id, flow_data, category) 
        VALUES($1, $2, $3, $4)
        ON CONFLICT (flow, user_id) DO
        UPDATE SET flow_data = user_flow_data.flow_data || jsonb_build_object($5::TEXT, $6::TEXT, 'timeAtAddress','10 years')
        WHERE user_flow_data.user_id = $2 AND user_flow_data.flow = $1
    `,
      [
        props.flow,
        props.userId,
        JSON.stringify({
          ...props.data,
          [props.field]: fullAddressString,
          timeAtAddress: "5 months",
        }),
        props.category,
        props.field,
        fullAddressString,
      ],
    );

    redirect(props.onSubmitRedirectSlug);
  }

  const addressError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.address,
  );
  const townError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.town,
  );
  const countyError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.county,
  );
  const eireError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.eirecode,
  );

  return (
    <form action={submitAction}>
      <fieldset className="govie-fieldset">
        <div
          className={`govie-form-group ${
            addressError ? "govie-form-group--error" : ""
          }`.trim()}
        >
          {addressError && (
            <p id="input-field-error" className="govie-error-message">
              <span className="govie-visually-hidden">Error:</span>
              {errorT(addressError.messageKey, {
                field: errorT("fields.address"),
                indArticleCheck: "an",
              })}
            </p>
          )}
          <label htmlFor="addressFirst" className="govie-label--s">
            {t("firstLineOfAddress")}
          </label>
          <input
            type="text"
            id="addressFirst"
            name="addressFirst"
            className="govie-input"
          />
        </div>

        <div
          className={`govie-form-group ${
            townError ? "govie-form-group--error" : ""
          }`.trim()}
        >
          {townError && (
            <p id="input-field-error" className="govie-error-message">
              <span className="govie-visually-hidden">Error:</span>
              {errorT(townError.messageKey, {
                field: errorT("fields.town"),
                indArticleCheck: "",
              })}
            </p>
          )}
          <label htmlFor="town" className="govie-label--s">
            {t("town")}
          </label>
          <input type="text" id="town" name="town" className="govie-input" />
        </div>

        <div
          className={`govie-form-group ${
            countyError ? "govie-form-group--error" : ""
          }`.trim()}
        >
          {countyError && (
            <p id="input-field-error" className="govie-error-message">
              <span className="govie-visually-hidden">Error:</span>
              {errorT(countyError.messageKey, {
                field: errorT("fields.county"),
                indArticleCheck: "",
              })}
            </p>
          )}
          <label htmlFor="county" className="govie-label--s">
            {t("county")}
          </label>
          <input
            type="text"
            id="county"
            name="county"
            className="govie-input"
          />
        </div>

        <div
          className={`govie-form-group ${
            eireError ? "govie-form-group--error" : ""
          }`.trim()}
        >
          {eireError && (
            <p id="input-field-error" className="govie-error-message">
              <span className="govie-visually-hidden">Error:</span>
              {errorT(eireError.messageKey, {
                field: errorT("fields.eirecode"),
                indArticleCheck: "an",
              })}
            </p>
          )}
          <label htmlFor="eirecode" className="govie-label--s">
            {t("eirecode")}
          </label>
          <input
            type="text"
            id="eirecode"
            name="eirecode"
            className="govie-input"
          />
        </div>
      </fieldset>
      <button className="govie-button">{t("continueWithAddress")}</button>
    </form>
  );
}

export default <TData,>(props: Props<TData>) => {
  const t = useTranslations("AddressForm");
  const searchParams = new URLSearchParams(props.searchParams);
  const isManualForm = searchParams.get(searchParamKeys.formType) === "manual";
  let Form = isManualForm
    ? ManualAddressForm
    : searchParams.get(searchParamKeys.address)
      ? SelectForm
      : SearchForm;

  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds">
        <h1 className="govie-heading-l">{props.title || t("new-address")}</h1>
        {!isManualForm && props.showWarning && (
          <>
            <div className="govie-warning-text">
              <span className="govie-warning-text__icon" aria-hidden="true">
                !
              </span>
              <strong className="govie-warning-text__text">
                <span className="govie-warning-text__assistive">
                  {t("warning")}
                </span>
                {t("warningText")}
              </strong>
            </div>
            <h2 className="govie-heading-m">{t("addressSearchTitle")}</h2>
          </>
        )}

        <Form
          addressQuery={searchParams.get(searchParamKeys.address) ?? ""}
          flow={props.flow}
          userId={props.userId}
          data={props.data}
          slug={props.slug}
          category={props.category}
          onSubmitRedirectSlug={props.onSubmitRedirectSlug}
          field={props.field}
        />
      </div>
    </div>
  );
};
