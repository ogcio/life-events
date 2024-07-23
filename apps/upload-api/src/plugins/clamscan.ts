import NodeClam from "clamscan";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyRequest {
    avClient: NodeClam;
  }
}

export default fp(
  async (fastify) => {
    const avClient = await new NodeClam().init({
      clamdscan: {
        host: fastify.config.CLAMAV_HOST as string,
        port: 3310,
      },
    });

    fastify.decorate("avClient", avClient);
  },
  { name: "clamscanPlugin" },
);
