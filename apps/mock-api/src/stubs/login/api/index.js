import pg from "pg";

export default async function (app, opts) {
  app.get("/users", async (request, reply) => {
    console.log(process.env);
    const c = new pg.Client({
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
    });
    c.connect();
    const res = await c.query("select * from users");
    await c.end();
    return { users: res.rows };
  });
}
