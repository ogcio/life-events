import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { HttpError } from "../../types/httpErrors";
import {
  OrganisationInvitationFeedbackSchema,
  OrganisationInvitationFeedback,
  OrganisationSetting,
  OrganisationSettingSchema,
} from "../../types/usersSchemaDefinitions";
import {
  getOrganisationSettingsForUser,
  getInvitationsForUser,
  updateInvitationStatus,
  updateOrganisationFeedback,
} from "../../services/users/invitations/accept-invitations";
import { Permissions } from "../../types/permissions";
import { getGenericResponseSchema } from "../../types/schemaDefinitions";

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
        tags,
        response: {
          200: getGenericResponseSchema(Type.Array(OrganisationSettingSchema)),
          400: HttpError,
          404: HttpError,
          500: HttpError,
        },
      },
    },
    async (request: FastifyRequest, _reply: FastifyReply) => ({
      data: await getInvitationsForUser({
        userProfileId: request.userData!.userId,
        pg: app.pg,
      }),
    }),
  );

  app.get<{
    Params: { organisationId: string };
    Response: { data: OrganisationSetting };
  }>(
    "/:organisationId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.CitizenSelf.Read]),
      schema: {
        tags,
        params: Type.Object({
          organisationId: Type.String(),
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
        Params: { organisationId: string };
        Response: { data: OrganisationSetting };
      }>,
      _reply: FastifyReply,
    ) => ({
      data: await getOrganisationSettingsForUser({
        userProfileId: request.userData!.userId,
        organisationId: request.params.organisationId,
        pg: app.pg,
      }),
    }),
  );

  interface PatchOrgInvitationSchema {
    Params: { organisationId: string };
    Body: OrganisationInvitationFeedback;
    Response: { data: OrganisationSetting };
  }

  app.patch<PatchOrgInvitationSchema>(
    "/:organisationId",
    {
      preValidation: (req, res) =>
        app.checkPermissions(req, res, [Permissions.CitizenSelf.Write]),
      schema: {
        tags,
        body: OrganisationInvitationFeedbackSchema,
        params: Type.Object({
          organisationId: Type.String(),
        }),
        response: {
          202: Type.Object({ data: OrganisationSettingSchema }),
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
      await updateInvitationStatus({
        userProfileId: request.userData!.userId,
        pg: app.pg,
        feedback: { userStatusFeedback: "active" },
      });

      return {
        data: await updateOrganisationFeedback({
          userProfileId: request.userData!.userId,
          organisationId: request.params.organisationId,
          pg: app.pg,
          feedback: request.body,
        }),
      };
    },
  );
}
