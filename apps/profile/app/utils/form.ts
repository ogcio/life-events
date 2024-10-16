import dayjs from "dayjs";
import { pgpool } from "./postgres";

export type Error = {
  messageKey: string;
  field: string;
  errorValue: string;
};

export const errorTranslationKeys = {
  empty: "empty",
  invalidField: "invalidField",
  emptySelection: "emptySelection",
};
export const fieldTranslationKeys = {
  email: "email",
  phone: "phone",
  address: "address",
  address_first_line: "addressFirstLine",
  address_second_line: "addressSecondLine",
  town: "town",
  eirecode: "eirecode",
  county: "county",
  day: "day",
  month: "month",
  year: "year",
  moveInDay: "moveInDay",
  moveInMonth: "moveInMonth",
  moveInYear: "moveInYear",
  moveOutDay: "moveOutDay",
  moveOutMonth: "moveOutMonth",
  moveOutYear: "moveOutYear",
  isOwner: "owner",
  isPrimaryAddress: "primaryAddress",
};

export const validation = {
  dateErrors(
    year: { field: string; value?: number },
    month: { field: string; value?: number },
    day: { field: string; value?: number },
  ): Error[] {
    const formErrors: Error[] = [];
    if (!day?.value) {
      formErrors.push({
        field: day.field,
        messageKey: errorTranslationKeys.empty,
        errorValue: "",
      });
    }

    if (!month?.value) {
      formErrors.push({
        field: month.field,
        messageKey: errorTranslationKeys.empty,
        errorValue: "",
      });
    }

    if (!year.value) {
      formErrors.push({
        field: year.field,
        messageKey: errorTranslationKeys.empty,
        errorValue: "",
      });
    }

    // If we have all of the values, we can determine wether they are acceptable..
    if (day.value && month.value && year.value) {
      const isValidMonth = month.value <= 12 && month.value > 0;
      const isValidYear =
        year.value > 1900 && year.value <= new Date().getUTCFullYear();

      if (!isValidMonth) {
        formErrors.push(
          {
            field: month.field,
            messageKey: errorTranslationKeys.invalidField,
            errorValue: month.value?.toString() || "",
          },
          {
            // impossible to validate a day without month
            errorValue: day.value.toString() || "",
            field: day.field,
            messageKey: errorTranslationKeys.invalidField,
          },
        );
      }

      if (!isValidYear) {
        formErrors.push({
          field: year.field,
          messageKey: errorTranslationKeys.invalidField,
          errorValue: year.value?.toString() || "",
        });
      }

      // Actual day validation
      if (isValidMonth && isValidYear) {
        const date = dayjs(`${year.value}-${month.value}`);

        if (day.value > date.daysInMonth() || day.value < 0) {
          formErrors.push({
            field: day.field,
            messageKey: errorTranslationKeys.invalidField,
            errorValue: day.value?.toString() || "",
          });
        }
      }
    }
    return formErrors;
  },
  stringNotEmpty(field: string, value?: string): Error[] {
    return !value?.length
      ? [
          {
            field,
            messageKey: errorTranslationKeys.empty,
            errorValue: value?.toString() || "",
          },
        ]
      : [];
  },
  emailErrors(field: string, value?: string): Error[] {
    return !value?.length
      ? [
          {
            field,
            messageKey: errorTranslationKeys.empty,
            errorValue: value || "",
          },
        ]
      : !/[a-z0-9\._%+!$&*=^|~#%'`?{}/\-]+@([a-z0-9\-]+\.){1,}([a-z]{2,16})/.test(
            value,
          )
        ? [
            {
              field,
              messageKey: errorTranslationKeys.invalidField,
              errorValue: value || "",
            },
          ]
        : [];
  },
};

export async function insertErrors(
  formErrors: Error[],
  userId: string,
  slug: string,
) {
  "use server";
  let i = 1;
  const values: string[] = [];
  for (const _ of formErrors) {
    values.push(`($1, $2, $${2 + i}, $${3 + i}, $${4 + i})`);
    i += 3;
  }

  await pgpool.query(
    `
      INSERT INTO form_errors(user_id, slug, field, error_message, error_value)
      VALUES ${values.join(", ")}
      `,
    [
      userId,
      slug,
      ...formErrors
        .map((error) => [error.field, error.messageKey, error.errorValue])
        .flat(),
    ],
  );
}

export async function getErrorsQuery(userId: string, slug: string) {
  "use server";

  const result = await pgpool.query<
    { field: string; messageKey: string; errorValue: string },
    string[]
  >(
    `
      DELETE FROM form_errors
      WHERE "user_id" = $1 AND "slug" = $2
      RETURNING field, error_message AS "messageKey", error_value AS "errorValue"
    `,
    [userId, slug],
  );

  return result;
}
