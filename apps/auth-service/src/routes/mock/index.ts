import { FastifyInstance } from "fastify";
import { Type } from "@sinclair/typebox";
import { HttpError } from "../../types/httpErrors.js";
import { exportJWK, importSPKI } from "jose";

export default async function login(app: FastifyInstance) {
  app.get<{
    Querystring: {
      response_type: string;
      client_id: string;
      redirect_uri: string;
      state: string;
      nonce: string;
      scope: string;
    };
  }>(
    "/auth",
    {
      schema: {
        tags: ["Mock"],
        querystring: {
          response_type: Type.String(),
          client_id: Type.String(),
          redirect_uri: Type.String(),
          state: Type.String(),
          nonce: Type.String(),
          scope: Type.String(),
        },
        response: { 200: Type.String(), 500: HttpError },
      },
    },
    async (request, reply) => {
      const { redirect_uri, state } = request.query;

      const authorizeUrl = `${app.config.MYGOVID_MOCK_URL}?redirect_uri=${redirect_uri}&state=${state}`;

      return reply.redirect(authorizeUrl);
    },
  );

  app.post<{
    Body: {
      code: string;
      grant_type: string;
      redirect_uri: string;
      client_id: string;
      client_secret: string;
    };
    Reply: {
      id_token: string;
      access_token: string;
      token_type: string;
      not_before: number;
      expires_in: number;
      expires_on: number;
      id_token_expires_in: number;
      profile_info: string;
      scope: string;
    };
  }>(
    "/token",
    {
      schema: {
        tags: ["Mock"],
        body: Type.Object({
          code: Type.String(),
          grant_type: Type.String(),
          redirect_uri: Type.String(),
          client_id: Type.String(),
          client_secret: Type.String(),
        }),
        response: {
          200: Type.Object({
            id_token: Type.String(),
            access_token: Type.String(),
            token_type: Type.String(),
            not_before: Type.Number(),
            expires_in: Type.Number(),
            expires_on: Type.Number(),
            id_token_expires_in: Type.Number(),
            profile_info: Type.String(),
            scope: Type.String(),
          }),
          500: HttpError,
        },
      },
    },
    async (request, _) => {
      const id_token = request.body.code;
      return {
        id_token,
        access_token: id_token,
        token_type: "Bearer",
        not_before: Date.now() - 5000,
        expires_in: 1800,
        expires_on: Date.now() - 5000 + 1800,
        id_token_expires_in: 1800,
        profile_info:
          "eyJ2ZXIiOiIxLjAiLCJ0aWQiOiI4OTc5MmE2ZC0xZWE0LTQxMjYtOTRkZi1hNzFkMjkyZGViYzciLCJzdWIiOm51bGwsIm5hbWUiOm51bGwsInByZWZlcnJlZF91c2VybmFtZSI6bnVsbCwiaWRwIjpudWxsfQ",
        scope: "openid",
      };
    },
  );

  app.get<{
    Reply: {
      keys: {
        kid: string;
        use: string;
        kty?: string;
        n?: string;
        e?: string;
      }[];
    };
  }>(
    "/keys",
    {
      schema: {
        tags: ["Mock"],
        response: {
          200: Type.Object({
            keys: Type.Array(
              Type.Object({
                kid: Type.String(),
                use: Type.String(),
                kty: Type.Optional(Type.String()),
                n: Type.Optional(Type.String()),
                e: Type.Optional(Type.String()),
              }),
            ),
          }),
          500: HttpError,
        },
      },
    },
    async (request, reply) => {
      const key = process.env.JWK_PUBLIC_KEY!;

      const publicKey = await importSPKI(key, "RS256");
      const { kty, n, e } = await exportJWK(publicKey);

      return {
        keys: [{ kid: "signingkey.mygovid.v1", use: "sig", kty, n, e }],
      };
    },
  );
}
