import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Type } from "@sinclair/typebox";
import { HttpError } from "../../types/httpErrors";
import {
  OrganisationInvitationFeedbackSchema,
  OrganisationInvitationFeedback,
  UserInvitation,
  UserInvitationSchema,
  User,
  InvitationFeedback,
  InvitationFeedbackSchema,
  UserSchema,
  UserStatusUnionType,
} from "../../types/usersSchemaDefinitions";
import {
  getInvitationForUser,
  getInvitationStatus,
  getInvitationsForUser,
  updateInvitationStatus,
  updateOrganisationFeedback,
} from "../../services/users/invitations/accept-invitations";

const tags = ["UserSettings"];

/*
 * The routes in this file are meant to be used on the "citizen" side
 */
export default async function userSettings(app: FastifyInstance) {
  app.get(
    "/organisations",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        response: {
          200: Type.Object({ data: Type.Array(UserInvitationSchema) }),
          400: HttpError,
          404: HttpError,
          500: HttpError,
        },
      },
    },
    async (request: FastifyRequest, _reply: FastifyReply) => ({
      data: await getInvitationsForUser({
        userProfileId: request.user!.id,
        pg: app.pg,
      }),
    }),
  );

  app.get<{
    Params: { organisationId: string };
    Response: { data: UserInvitation };
  }>(
    "/organisations/:organisationId",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        params: Type.Object({
          organisationId: Type.String(),
        }),
        response: {
          200: Type.Object({ data: UserInvitationSchema }),
          400: HttpError,
          404: HttpError,
          500: HttpError,
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: { organisationId: string };
        Response: { data: UserInvitation };
      }>,
      _reply: FastifyReply,
    ) => ({
      data: await getInvitationForUser({
        userProfileId: request.user!.id,
        organisationId: request.params.organisationId,
        pg: app.pg,
      }),
    }),
  );

  interface PatchOrgInvitationSchema {
    Params: { organisationId: string };
    Body: OrganisationInvitationFeedback;
    Response: { data: UserInvitation };
  }

  app.patch<PatchOrgInvitationSchema>(
    "/organisations/:organisationId",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        body: OrganisationInvitationFeedbackSchema,
        params: Type.Object({
          organisationId: Type.String(),
        }),
        response: {
          202: Type.Object({ data: UserInvitationSchema }),
          400: HttpError,
          404: HttpError,
          500: HttpError,
        },
      },
    },
    async (
      request: FastifyRequest<PatchOrgInvitationSchema>,
      _reply: FastifyReply,
    ) => ({
      data: await updateOrganisationFeedback({
        userProfileId: request.user!.id,
        organisationId: request.params.organisationId,
        pg: app.pg,
        feedback: request.body,
      }),
    }),
  );

  interface PatchInvitationSchema {
    Body: InvitationFeedback;
    Response: { data: User };
  }

  app.patch<PatchInvitationSchema>(
    "/invitations/me",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        body: InvitationFeedbackSchema,
        response: {
          202: Type.Object({ data: UserSchema }),
          400: HttpError,
          404: HttpError,
          500: HttpError,
        },
      },
    },
    async (
      request: FastifyRequest<PatchInvitationSchema>,
      _reply: FastifyReply,
    ) => ({
      data: await updateInvitationStatus({
        userProfileId: request.user!.id,
        pg: app.pg,
        feedback: request.body,
      }),
    }),
  );

  app.get(
    "/invitations/me",
    {
      preValidation: app.verifyUser,
      schema: {
        tags,
        response: {
          200: Type.Object({
            data: Type.Object({ userStatus: UserStatusUnionType }),
          }),
          400: HttpError,
          404: HttpError,
          500: HttpError,
        },
      },
    },
    async (request: FastifyRequest, _reply: FastifyReply) => ({
      data: await getInvitationStatus({
        userProfileId: request.user!.id,
        pg: app.pg,
      }),
    }),
  );
}
