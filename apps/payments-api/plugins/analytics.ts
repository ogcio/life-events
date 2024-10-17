import { OGCIO } from "analytics-sdk";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

export type AnalyticsPlugin = Awaited<ReturnType<typeof buildPlugin>>;

const buildPlugin = async () => {
  const ogcioAnalyticsSDK = new OGCIO();
  await ogcioAnalyticsSDK.auth({
    applicationId: process.env.AUTH_APP_ID,
    applicationSecret: process.env.AUTH_APP_SECRET,
    logtoOidcEndpoint: process.env.AUTH_OIDC_ENDPOINT,
    organizationId: process.env.AUTH_ORGANIZATION_ID,
    scopes: process.env.AUTH_SCOPES ? process.env.AUTH_SCOPES.split(",") : undefined
  });

  return {
    sdk: ogcioAnalyticsSDK
  };
};

const initPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    const plugin = await buildPlugin();
    fastify.decorate("analytics", plugin);
  };
  
export default fp(initPlugin, {
  name: "analyticsPlugin",
});
