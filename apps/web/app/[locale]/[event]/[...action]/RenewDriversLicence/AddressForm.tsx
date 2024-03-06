import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  formConstants,
  getFormErrors,
  insertFormErrors,
  urlConstants,
} from "../../../../utils";
import { pgpool } from "../../../../dbConnection";
import Link from "next/link";

type Props<TData> = {
  userId: string;
  flow: string;
  searchParams?: Record<string, string>;
  data: TData;
};

type FormProps<TData> = Omit<Props<TData>, "searchParams"> & {
  addressQuery: string;
};

const searchParamKeys = { address: "adr", formType: "t" };

async function SearchForm<TData>(props: FormProps<TData>) {
  const t = await getTranslations("AddressForm");
  const errorT = await getTranslations("formErrors");
  const errors = await getFormErrors(
    props.userId,
    urlConstants.slug.newAddress,
    props.flow
  );

  async function searchAction(formData: FormData) {
    "use server";

    const searchQuery = formData.get("currentAddress");

    if (!searchQuery?.toString().length) {
      await insertFormErrors(
        [
          {
            messageKey: formConstants.errorTranslationKeys.empty,
            errorValue: "",
            field: formConstants.fieldTranslationKeys.address,
          },
        ],
        props.userId,
        urlConstants.slug.newAddress,
        props.flow
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
          id="currentAddress"
          name="currentAddress"
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
    await pgpool.query(
      `
        INSERT INTO user_flow_data (flow, user_id, flow_data) 
        VALUES($1, $2, $3)
        ON CONFLICT (flow, user_id) DO
        UPDATE SET flow_data = user_flow_data.flow_data || jsonb_build_object('currentAddress',$4::TEXT, 'timeAtAddress','10 years')
        WHERE user_flow_data.user_id = $2 AND user_flow_data.flow = $1
    `,
      [
        props.flow,
        props.userId,
        JSON.stringify({
          ...props.data,
          currentAddress: selectedAddress,
          timeAtAddress: "5 months",
        }),
        selectedAddress,
      ]
    );

    redirect("/driving/renew-licence/proof-of-address");
  }

  const urlParams = new URLSearchParams({ q: props.addressQuery });

  const addressResponse = await fetch(
    `${process.env.API_ENDPOINT}/static/addresses/api?${urlParams}`
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
  const errors = await getFormErrors(
    props.userId,
    urlConstants.slug.newAddress,
    props.flow
  );
  async function submitAction(formData: FormData) {
    "use server";
    const address = formData.get("currentAddress");

    if (!address?.toString().length) {
      await insertFormErrors(
        [
          {
            messageKey: formConstants.errorTranslationKeys.empty,
            errorValue: "",
            field: formConstants.fieldTranslationKeys.address,
          },
        ],
        props.userId,
        urlConstants.slug.newAddress,
        props.flow
      );
      return revalidatePath("/");
    }

    await pgpool.query(
      `
        INSERT INTO user_flow_data (flow, user_id, flow_data) 
        VALUES($1, $2, $3)
        ON CONFLICT (flow, user_id) DO
        UPDATE SET flow_data = user_flow_data.flow_data || jsonb_build_object('currentAddress',$4::TEXT, 'timeAtAddress','10 years')
        WHERE user_flow_data.user_id = $2 AND user_flow_data.flow = $1
    `,
      [
        props.flow,
        props.userId,
        JSON.stringify({
          ...props.data,
          currentAddress: address,
          timeAtAddress: "5 months",
        }),
        address,
      ]
    );

    redirect("/driving/renew-licence/proof-of-address");
  }

  const addressError = errors.rows.at(0);

  return (
    <form action={submitAction}>
      <div
        className={`govie-form-group ${
          addressError ? "govie-form-group--error" : ""
        }`.trim()}
      >
        <div className="govie-hint" id="input-field-hint">
          {t("manualAddressHeading")}
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
          id="currentAddress"
          name="currentAddress"
          className="govie-input"
          aria-describedby="input-field-hint"
        />
      </div>
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
        <h1 className="govie-heading-l">{t("title")}</h1>
        {!isManualForm && (
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
        />
      </div>
    </div>
  );
};
