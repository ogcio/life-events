import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { HttpError } from "../../types/httpErrors.js";
import {
  OrganisationInvitationFeedbackSchema,
  OrganisationInvitationFeedback,
  OrganisationSetting,
  OrganisationSettingSchema,
} from "../../types/usersSchemaDefinitions.js";
import {
  getOrganisationSettingsForProfile,
  updateInvitationStatus,
  updateOrganisationFeedback,
} from "../../services/users/invitations/accept-invitations.js";
import { Permissions } from "../../types/permissions.js";
import { getGenericResponseSchema } from "../../types/schemaDefinitions.js";
import { getSettingsPerUserProfile } from "../../services/users/shared-users.js";
import { ensureUserIdIsSet } from "../../utils/authentication-factory.js";

const tags = ["Organisation Settings"];

/*
 * The routes in this file are meant to be used on the "citizen" side
 */
export default async function organisationSettings(app: FastifyInstance) {
  app.get(
    "/",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.CitizenSelf.Read]),
      schema: {
        description: "Returns the organisation settings for the logged in user",
        tags,
        response: {
          200: getGenericResponseSchema(Type.Array(OrganisationSettingSchema)),
          400: HttpError,
          404: HttpError,
          500: HttpError,
        },
      },
    },
    async (request: FastifyRequest, _reply: FastifyReply) => {
      const errorCode = "GET_ORGANISATION_SETTINGS";
      const client = await app.pg.pool.connect();
      try {
        return {
          data: await getSettingsPerUserProfile({
            userProfileId: ensureUserIdIsSet(request, errorCode),
            client,
            errorCode,
          }),
        };
      } finally {
        client.release();
      }
    },
  );

  app.get<{
    Params: { organisationSettingId: string };
    Response: { data: OrganisationSetting };
  }>(
    "/:organisationSettingId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.CitizenSelf.Read]),
      schema: {
        description: "Returns the requested organisation setting",
        tags,
        params: Type.Object({
          organisationSettingId: Type.String(),
        }),
        response: {
          200: getGenericResponseSchema(OrganisationSettingSchema),
          400: HttpError,
          404: HttpError,
          500: HttpError,
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: { organisationSettingId: string };
        Response: { data: OrganisationSetting };
      }>,
      _reply: FastifyReply,
    ) => ({
      data: await getOrganisationSettingsForProfile({
        userProfileId: ensureUserIdIsSet(request, "GET_ORGANIZATION_SETTING"),
        organisationSettingId: request.params.organisationSettingId,
        pg: app.pg,
      }),
    }),
  );

  interface PatchOrgInvitationSchema {
    Params: { organisationSettingId: string };
    Body: OrganisationInvitationFeedback;
    Response: { data: OrganisationSetting };
  }

  app.patch<PatchOrgInvitationSchema>(
    "/:organisationSettingId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.CitizenSelf.Write]),
      schema: {
        description: "Updates the requested organisation settings",
        tags,
        body: OrganisationInvitationFeedbackSchema,
        params: Type.Object({
          organisationSettingId: Type.String(),
        }),
        response: {
          202: getGenericResponseSchema(OrganisationSettingSchema),
          400: HttpError,
          404: HttpError,
          500: HttpError,
        },
      },
    },
    async (
      request: FastifyRequest<PatchOrgInvitationSchema>,
      _reply: FastifyReply,
    ) => {
      const errorCode = "UPDATE_ORGANISATION_SETTINGS";
      await updateInvitationStatus({
        userProfileId: ensureUserIdIsSet(request, errorCode),
        pg: app.pg,
        feedback: { userStatusFeedback: "active" },
      });

      return {
        data: await updateOrganisationFeedback({
          userProfileId: ensureUserIdIsSet(request, errorCode),
          organisationSettingId: request.params.organisationSettingId,
          pg: app.pg,
          feedback: request.body,
        }),
      };
    },
  );
}