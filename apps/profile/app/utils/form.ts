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
};

export const validation = {
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

export async function insertErrors(formErrors: Error[], userId: string) {
  "use server";
  let i = 1;
  const values: string[] = [];
  for (const _ of formErrors) {
    values.push(`($1, $${1 + i}, $${2 + i}, $${3 + i})`);
    i += 3;
  }

  await pgpool.query(
    `
      INSERT INTO form_errors(user_id, field, error_message, error_value)
      VALUES ${values.join(", ")}
  `,
    [
      userId,
      ...formErrors
        .map((error) => [error.field, error.messageKey, error.errorValue])
        .flat(),
    ],
  );
}

export async function getErrorsQuery(userId: string) {
  "use server";

  return pgpool.query<
    { field: string; messageKey: string; errorValue: string },
    string[]
  >(
    `
      DELETE FROM form_errors
      WHERE user_id = $1
      RETURNING field, error_message AS "messageKey", error_value AS "errorValue"
    `,
    [userId],
  );
}
