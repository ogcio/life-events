export default async function (app, opts) {
  app.get("/users", async (request, reply) => {
    const res = await app.pg.query("select * from users");
    return { users: res.rows };
  });
}
