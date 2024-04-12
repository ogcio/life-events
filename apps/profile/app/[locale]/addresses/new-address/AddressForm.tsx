import { NextPageProps } from "../../../../types";
import { form, postgres } from "../../../utils";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PgSessions } from "auth/sessions";

type FormProps = {
  userData: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  addressQuery: string;
};

const searchParamKeys = { address: "adr", formType: "t" };

async function SearchForm(props: FormProps) {
  const { userId } = props.userData;
  const t = await getTranslations("AddressForm");
  const errorT = await getTranslations("FormErrors");
  const errors = await form.getErrorsQuery(userId);

  async function searchAction(formData: FormData) {
    "use server";

    const searchQuery = formData.get("newAddress");

    if (!searchQuery?.toString().length) {
      await form.insertErrors(
        [
          {
            messageKey: form.errorTranslationKeys.empty,
            errorValue: "",
            field: form.fieldTranslationKeys.address,
          },
        ],
        userId,
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
            <span className="govie-visually-hidden">{t("error")}</span>
            {errorT(addressError.messageKey, {
              field: errorT("fields.address"),
              indArticleCheck: "an",
            })}
          </p>
        )}
        <input
          type="text"
          id={"newAddress"}
          name={"newAddress"}
          className="govie-input"
          aria-describedby="input-field-hint"
        />
      </div>
      <button className="govie-button">{t("findAddress")}</button>
    </form>
  );
}

async function SelectForm(props: FormProps) {
  const t = await getTranslations("AddressForm");
  const selectName = "selected-addr";
  const { userId, firstName, lastName, email } = props.userData;

  async function submitAction(formData: FormData) {
    "use server";
    const selectedAddress = formData.get(selectName);

    if (!selectedAddress) {
      return;
    }

    const userExistsQuery = await postgres.pgpool.query(
      `
          SELECT 1
          FROM user_details
          WHERE user_id = $1
          `,
      [userId],
    );

    if (!userExistsQuery.rows.length) {
      await postgres.pgpool.query(
        `
                  INSERT INTO user_details (user_id, firstname, lastname, email)
                  VALUES ($1, $2, $3, $4)
                `,
        [userId, firstName, lastName, email],
      );
    }

    const [addressFirst, town, county, eirecode] = selectedAddress
      .toString()
      .split(",");

    await postgres.pgpool.query(
      `
        INSERT INTO user_addresses (user_id, address_line1, town, county, eirecode)
        VALUES($1, $2, $3, $4, $5)
    `,
      [
        userId,
        addressFirst.trim(),
        town.trim(),
        county.trim(),
        eirecode.trim(),
      ],
    );

    redirect("/");
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

async function ManualAddressForm(props: FormProps) {
  const { userId, firstName, lastName, email } = props.userData;
  const t = await getTranslations("AddressForm");
  const errorT = await getTranslations("FormErrors");
  const errors = await form.getErrorsQuery(userId);

  async function submitAction(formData: FormData) {
    "use server";
    const errors: form.Error[] = [];
    const addressFirst = formData.get("addressFirst");
    const addressSecond = formData.get("addressSecond");
    const town = formData.get("town");
    const county = formData.get("county");
    const eirecode = formData.get("eirecode");

    if (!addressFirst?.toString().length) {
      errors.push({
        messageKey: form.errorTranslationKeys.empty,
        errorValue: "",
        field: form.fieldTranslationKeys.addressFirstLine,
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
      await form.insertErrors(errors, userId);
      return revalidatePath("/");
    }

    const userExistsQuery = await postgres.pgpool.query(
      `
        SELECT 1
        FROM user_details
        WHERE user_id = $1
        `,
      [userId],
    );

    if (!userExistsQuery.rows.length) {
      await postgres.pgpool.query(
        `
                INSERT INTO user_details (user_id, firstname, lastname, email)
                VALUES ($1, $2, $3, $4)
              `,
        [userId, firstName, lastName, email],
      );
    }

    await postgres.pgpool.query(
      `
          INSERT INTO user_addresses (user_id, address_line1, address_line2, town, county, eirecode)
          VALUES($1, $2, $3, $4, $5, $6)
      `,
      [userId, addressFirst, addressSecond, town, county, eirecode],
    );

    redirect("/");
  }

  const addressFirstLineError = errors.rows.find(
    (row) => row.field === form.fieldTranslationKeys.addressFirstLine,
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
            addressFirstLineError ? "govie-form-group--error" : ""
          }`.trim()}
        >
          {addressFirstLineError && (
            <p id="input-field-error" className="govie-error-message">
              <span className="govie-visually-hidden">{t("error")}:</span>
              {errorT(addressFirstLineError.messageKey, {
                field: errorT("fields.addressFirstLine"),
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

        <div className="govie-form-group">
          <label htmlFor="addressFirst" className="govie-label--s">
            {t("secondLineOfAddress")}
          </label>
          <input
            type="text"
            id="addressSecond"
            name="addressSecond"
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
              <span className="govie-visually-hidden">{t("error")}:</span>
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
              <span className="govie-visually-hidden">{t("error")}:</span>
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
              <span className="govie-visually-hidden">{t("error")}:</span>
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

export default async (props: { params: NextPageProps }) => {
  const { params } = props;
  const { searchParams } = params;
  const t = await getTranslations("AddressForm");
  const { userId, firstName, lastName, email } = await PgSessions.get();
  const userData = { userId, firstName, lastName, email };
  console.log("== USER ID ===", userId);
  const searchUrl = new URLSearchParams(searchParams);
  const isManualForm = searchUrl.get(searchParamKeys.formType) === "manual";
  let Form = isManualForm
    ? ManualAddressForm
    : searchUrl?.get(searchParamKeys.address)
      ? SelectForm
      : SearchForm;

  return (
    <div className="govie-grid-row">
      <div className="govie-grid-column-two-thirds">
        <h1 className="govie-heading-l">{t("newAddress")}</h1>
        <Form
          addressQuery={searchUrl?.get(searchParamKeys.address) ?? ""}
          userData={userData}
        />
        <Link href={"/"} className="govie-back-link">
          {t("back")}
        </Link>
      </div>
    </div>
  );
};
