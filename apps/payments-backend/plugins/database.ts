import pg from "pg";
import { FastifyPluginCallback } from "fastify";

const databasePlugin: FastifyPluginCallback = (fastify, options, done) => {
  const { Pool } = pg;
  const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB_NAME,
  });

  fastify.decorate("pgpool", pool);
  done();
};

export default databasePlugin;
