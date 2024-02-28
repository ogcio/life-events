import { useTranslations } from "next-intl";
import { redirect } from "next/navigation";
import { pgpool } from "../../../../sessions";

type Props<TData> = {
  userId: string;
  flow: string;
  addressSearchQuery?: string;
  data: TData;
};

function SearchForm() {
  const t = useTranslations("AddressForm");
  async function searchAction(formData: FormData) {
    "use server";

    const searchQuery = formData.get("currentAddress");
    if (searchQuery) {
      redirect("?adr=" + searchQuery);
    }
  }
  return (
    <form action={searchAction}>
      <div className="govie-form-group">
        <div className="govie-hint" id="input-field-hint">
          {t("searchHint")}
        </div>
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

async function SelectForm<TData>(props: Props<TData>) {
  const t = useTranslations("AddressForm");
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

  async function findAddresses(searchQuery: string) {
    "use server";
    // Get them from wherever we need later
    return Promise.resolve([
      "1 ballincar Heights Country Sligo F91 DK74 Ireland",
      "Apartment 69 Block G Rosse Court Heights Rosse Court Rise Lucan Co. Dublin K78RT72",
    ]);
  }

  const options = (await findAddresses(props.addressSearchQuery || "")).map(
    (addr) => (
      <option key={addr} value={addr}>
        {addr}
      </option>
    )
  );

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
      <a>{t("notListedTextLink")}</a>
    </>
  );
}

export default <TData,>(props: Props<TData>) => {
  const t = useTranslations("AddressForm");
  const Form = props.addressSearchQuery ? SelectForm : SearchForm;
  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds">
        <h1 className="govie-heading-l">{t("title")}</h1>
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
        <p></p>
        <h2 className="govie-heading-m">{t("addressSearchTitle")}</h2>
        {/* @ts-expect-error Async Server Component */}
        <Form
          addressSearchQuery={props.addressSearchQuery}
          flow={props.flow}
          userId={props.userId}
          data={props.data}
        />
      </div>
    </div>
  );
};
