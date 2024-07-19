import { Pool } from "pg";
import { DEFAULT_LANGUAGE, UserDetails } from "../../types/schemaDefinitions";
import {
  BadRequestError,
  NotImplementedError,
  ServerError,
} from "shared-errors";

const ERROR_PROCESS = "USERS_WEBHOOK";
const MY_GOV_ID_IDENTITY = "MyGovId (MyGovId connector)";

export const processUserWebhook = async (params: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
  pool: Pool;
}): Promise<{ id: string }> => {
  switch (params.body.event) {
    case "User.Data.Updated":
    case "User.Created":
      return upsertUser({ ...params });
    default:
      throw new NotImplementedError(
        ERROR_PROCESS,
        `This event, ${params.body.event}, is not managed yet`,
      );
  }
};

const upsertUser = async (params: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
  pool: Pool;
}): Promise<{ id: string }> => {
  const user = webhookBodyDataToUser(params.body.data);
  const values = [
    user.id,
    user.title,
    user.firstName,
    user.lastName,
    user.dateOfBirth,
    user.ppsn,
    user.gender,
    user.phone,
    user.email,
    user.ppsnVisible,
    user.consentToPrefillData,
  ];
  // The values where we use COALESCE
  // are the ones that currently are not mapped
  // using the webhook body. Then, if a value
  // is set in another way, just use it
  const query = `
    INSERT INTO user_details
        (
            user_id,
            title,
            firstname,
            lastname,
            date_of_birth,
            ppsn,
            gender,
            phone,
            email, 
            ppsn_visible,
            consent_to_prefill_data
        )
    VALUES
        (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        )
    ON CONFLICT(user_id) 
    DO UPDATE SET
        title = COALESCE(user_details.title, EXCLUDED.title),
        firstname = EXCLUDED.firstname,
        lastname = EXCLUDED.lastname,
        date_of_birth = EXCLUDED.date_of_birth,
        ppsn = EXCLUDED.ppsn,
        gender = COALESCE(user_details.gender, EXCLUDED.gender),
        phone = EXCLUDED.phone,
        email = EXCLUDED.email, 
        ppsn_visible = COALESCE(user_details.ppsn_visible, EXCLUDED.ppsn_visible),
        consent_to_prefill_data = COALESCE(user_details.consent_to_prefill_data, EXCLUDED.consent_to_prefill_data)
    RETURNING user_id as "id";
  `;

  const result = await params.pool.query<{ id: string }>(query, values);

  if (result.rowCount === 0) {
    throw new ServerError(
      ERROR_PROCESS,
      `Cannot upsert user with id ${user.id}`,
    );
  }

  return result.rows[0];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const webhookBodyDataToUser = (bodyData: any): UserDetails & { id: string } => {
  if (!bodyData.identities[MY_GOV_ID_IDENTITY]) {
    throw new BadRequestError(
      ERROR_PROCESS,
      `Missing the ${MY_GOV_ID_IDENTITY} identity`,
    );
  }
  const identity = bodyData.identities[MY_GOV_ID_IDENTITY].details;

  return {
    id: bodyData.id as string,
    firstName: identity.rawData.firstName,
    lastName: identity.rawData.lastName,
    email: identity.email,
    phone: parseValue(identity.phone),
    dateOfBirth: dateToDbDatetime(identity.rawData.BirthDate),
    ppsn: parseValue(identity.rawData.PublicServiceNumber),
    ppsnVisible: true,
    consentToPrefillData: false,
    gender: null,
    title: null,
    preferredLanguage: DEFAULT_LANGUAGE,
  };
};

const parseValue = <T>(value: T | undefined | null): T | null => {
  if (typeof value === "undefined" || value === null) {
    return null;
  }

  if (typeof value === "string" && value.length === 0) {
    return null;
  }

  return value;
};

const dateToDbDatetime = (value: string | null | undefined): string | null => {
  if (value === null || typeof value === "undefined" || value.length === 0) {
    return null;
  }

  const splitted = value.split("/");

  const parsed = new Date(
    Number(splitted[2]),
    Number(splitted[1]) - 1,
    Number(splitted[0]),
    0,
    0,
    0,
    0,
  );

  return parsed.toISOString();
};
