import ds from "design-system";
import { getTranslations } from "next-intl/server";
import "./ProfileForm.css";
import UserDetails from "./UserDetails";
import Addresses from "./Addresses";
import Entitlements from "./Entitlements";
import Consent from "./Consent";
import { revalidatePath } from "next/cache";
import { form, postgres } from "../utils";
import { PgSessions } from "auth/sessions";

async function submitAction(formData: FormData) {
  "use server";

  const { userId } = await PgSessions.get();

  const formErrors: form.Error[] = [];

  const phone = formData.get("phone")?.toString();
  formErrors.push(
    ...form.validation.stringNotEmpty(form.fieldTranslationKeys.phone, phone),
  );

  const email = formData.get("email")?.toString();
  formErrors.push(
    ...form.validation.emailErrors(form.fieldTranslationKeys.email, email),
  );

  if (formErrors.length) {
    await form.insertErrors(formErrors, userId);

    return revalidatePath("/");
  }

  const dayOfBirth = formData.get("dayOfBirth");
  const monthOfBirth = formData.get("monthOfBirth");
  const yearOfBirth = formData.get("yearOfBirth");

  const dateOfBirth = new Date(
    Number(yearOfBirth),
    Number(monthOfBirth) - 1,
    Number(dayOfBirth),
  );

  let data = {
    user_id: userId,
    date_of_birth: dateOfBirth,
    title: "",
    firstName: "",
    lastName: "",
    ppsn: "",
    gender: "",
    phone: "",
    email: "",
  };

  const formIterator = formData.entries();
  let iterResult = formIterator.next();

  while (!iterResult.done) {
    const [key, value] = iterResult.value;

    if (
      [
        "title",
        "firstName",
        "lastName",
        "ppsn",
        "gender",
        "phone",
        "email",
      ].includes(key)
    ) {
      data[key] = value;
    }

    iterResult = formIterator.next();
  }

  const currentDataResults = await postgres.pgpool.query(
    `
      SELECT * FROM user_details
      WHERE user_id = $1
  `,
    [userId],
  );

  const keys = Object.keys(data);
  const values = Object.values(data);

  if (currentDataResults.rows.length > 0) {
    const setClause = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(", ");
    console.log("== UPDATING ===");
    await postgres.pgpool.query(
      `
        UPDATE user_details
        SET ${setClause}
        WHERE user_id = $${keys.length + 1}
      `,
      [...values, userId],
    );
  } else {
    const columns = keys.join(", ");
    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

    await postgres.pgpool.query(
      `
        INSERT INTO user_details (${columns})
        VALUES (${placeholders})
      `,
      values,
    );
  }
}

export default async () => {
  const t = await getTranslations("AboutMe");

  return (
    <div>
      <h1 className="govie-heading-l">{t("title")}</h1>
      <p
        className="govie-body"
        style={{ display: "flex", alignItems: " center" }}
      >
        <span style={{ marginRight: "10px" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25">
            <path
              d="M12.5 0C19.402 0 25 5.598 25 12.5S19.402 25 12.5 25 0 19.402 0 12.5 5.598 0 12.5 0Zm0 0"
              fill="#0b0c0c"
            />
            <path
              d="M12.875 16.887h-.75l-.578-10.461h1.906Zm-1.18 4.543v-1.614h1.61v1.614Zm0 0"
              fill="#fff"
            />
          </svg>{" "}
        </span>
        <strong>
          {t.rich("subtitle", {
            red: (chunks) => {
              return (
                <span style={{ color: ds.colours.ogcio.red }}>{chunks}</span>
              );
            },
          })}
        </strong>
      </p>
      <form action={submitAction}>
        <UserDetails />
        <hr style={{ marginBottom: "30px" }} />
        <Addresses />
        <hr style={{ marginBottom: "30px" }} />
        <Entitlements />
        <hr style={{ marginBottom: "30px" }} />
        <Consent />
        <hr style={{ marginBottom: "30px" }} />
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <button
            type="submit"
            data-module="govie-button"
            className="govie-button"
            style={{ marginBottom: 0 }}
          >
            {t("save")}
          </button>
          <button
            type="button"
            data-module="govie-button"
            className="govie-button govie-button--secondary"
            style={{ marginBottom: 0 }}
          >
            {t("cancel")}
          </button>
        </div>
      </form>
    </div>
  );
};
