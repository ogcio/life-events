import * as pg from "pg";
import { FastifyPluginCallback } from "fastify";

const databasePlugin: FastifyPluginCallback = (fastify, options, done) => {
  const { Pool } = pg;
  const pool = new Pool({
    connectionString: fastify.config.DB_CONNECTION_STRING,
  });
  console.log("DB connected");
  fastify.decorate("pgpool", pool);
  done();
};

export default databasePlugin;
