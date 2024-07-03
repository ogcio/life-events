import { S3Client } from "@aws-sdk/client-s3";
import fp from "fastify-plugin";

export default fp(
  async (fastify) => {
    const credentials: { accessKeyId: string; secretAccessKey: string } = {
      accessKeyId: "",
      secretAccessKey: "",
    };
    const { S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = fastify.config;

    if (S3_ACCESS_KEY_ID && S3_SECRET_ACCESS_KEY) {
      credentials.accessKeyId = S3_ACCESS_KEY_ID;
      credentials.secretAccessKey = S3_SECRET_ACCESS_KEY;
    }

    const config = {
      region: fastify.config.S3_REGION,
      endpoint: fastify.config.S3_ENDPOINT,
      forcePathStyle: true,
      ...(credentials.accessKeyId.length > 0 &&
      credentials.secretAccessKey.length > 0
        ? { credentials: credentials }
        : undefined),
    };

    const s3Config = {
      config,
      bucketName: fastify.config.S3_BUCKET_NAME,
      client: new S3Client(config),
    };

    fastify.decorate("s3Client", s3Config);
  },
  { name: "s3ClientPlugin" },
);
