import dayjs from "dayjs";
import { pgpool } from "./dbConnection";

export type FormError = {
  messageKey: string;
  field: string;
  errorValue: string;
};

export const formConstants = {
  errors: {
    empty: "empty",
    emptySelection: "emptySelection",
    noFile: "noFile",
    invalidEmail: "invalidEmail",
    invalidRangeMonth: "invalidRangeMonth",
    invalidRangeYear: "invalidRangeYear",
    invalidRangeDay: "invalidRangeDay",
  },
};

export const urlConstants = {
  slug: {
    renewLicence: "renew-licence",
    confirmApplication: "confirm-application",
    newAddress: "new-address",
    changeDetails: "change-details",
    checkDetails: "check-details",
    proofOfAddress: "proof-of-address",
    paymentSelection: "payment-selection",
    paymentSuccess: "payment-success",
    applicationSuccess: "application-success",
    medicalCertificate: "medical-certificate",
  },
};

/**
 *
 * @param hex Example format: #FFFFFF
 * @param o Opacity
 * @returns rgba from hex
 */
export function hexToRgba(hex: string, o: number) {
  const parts = hex
    .slice(1)
    .match(/.{1,2}/g)
    ?.map((item) => parseInt(item, 16)) ?? [0, 0, 0];
  return `rgba(${parts.join(", ")} , 0.${o.toString().padStart(2, "0")})`;
}

export const formValidation = {
  dateErrors(
    year: { field: string; value?: number },
    month: { field: string; value?: number },
    day: { field: string; value?: number }
  ): FormError[] {
    const formErrors: FormError[] = [];
    if (!day?.value) {
      formErrors.push({
        field: day.field,
        messageKey: formConstants.errors.empty,
        errorValue: "",
      });
    }

    if (!month?.value) {
      formErrors.push({
        field: month.field,
        messageKey: formConstants.errors.empty,
        errorValue: "",
      });
    }

    if (!year.value) {
      formErrors.push({
        field: year.field,
        messageKey: formConstants.errors.empty,
        errorValue: "",
      });
    }

    // If we have all of the values, we can determine wether they are acceptable..
    if (day.value && month.value && year.value) {
      const isValidMonth = month.value <= 12 && month.value > 0;
      const isValidYear =
        year.value > 1900 && year.value <= new Date().getUTCFullYear();

      if (!isValidMonth) {
        formErrors.push({
          field: month.field,
          messageKey: formConstants.errors.invalidRangeMonth,
          errorValue: month.value?.toString() || "",
        });
      }

      if (!isValidYear) {
        formErrors.push({
          field: year.field,
          messageKey: formConstants.errors.invalidRangeYear,
          errorValue: year.value?.toString() || "",
        });
      }

      if (isValidMonth && isValidYear) {
        const date = dayjs(`${year.value}-${month.value}`);

        if (day.value > date.daysInMonth() || day.value < 0) {
          formErrors.push({
            field: day.field,
            messageKey: formConstants.errors.invalidRangeDay,
            errorValue: day.value?.toString() || "",
          });
        }
      }
    }
    return formErrors;
  },
  stringNotEmpty(field: string, value?: string): FormError[] {
    return !value?.length
      ? [
          {
            field,
            messageKey: formConstants.errors.empty,
            errorValue: value?.toString() || "",
          },
        ]
      : [];
  },
  emailErrors(field: string, value?: string): FormError[] {
    return !value?.length
      ? [
          {
            field,
            messageKey: formConstants.errors.empty,
            errorValue: value || "",
          },
        ]
      : !/[a-z0-9\._%+!$&*=^|~#%'`?{}/\-]+@([a-z0-9\-]+\.){1,}([a-z]{2,16})/.test(
          value
        )
      ? [
          {
            field,
            messageKey: formConstants.errors.invalidEmail,
            errorValue: value || "",
          },
        ]
      : [];
  },
};

export async function insertFormErrors(
  formErrors: FormError[],
  userId: string,
  slug: string,
  flow: string
) {
  "use server";
  let i = 1;
  const values: string[] = [];
  for (const _ of formErrors) {
    values.push(`($1, $2, $3, $${3 + i}, $${4 + i}, $${5 + i})`);
    i += 3;
  }

  await pgpool.query(
    `
    INSERT INTO form_errors(user_id, flow, slug, field, error_message, error_value)
    VALUES ${values.join(", ")}
`,
    [
      userId,
      flow,
      slug,
      ...formErrors
        .map((error) => [error.field, error.messageKey, error.errorValue])
        .flat(),
    ]
  );
}

/**
 * Returns all errors for the a specific slug, flow and user, after deleting them.
 */
export async function getFormErrors(
  userId: string,
  slug: string,
  flow: string
) {
  "use server";

  return pgpool.query<
    { field: string; messageKey: string; errorValue: string },
    string[]
  >(
    `
    DELETE FROM form_errors
    WHERE user_id = $1 AND slug = $2 AND flow = $3
    RETURNING field, error_message AS "messageKey", error_value AS "errorValue"
  `,
    [userId, slug, flow]
  );
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(amount / 100);
}
