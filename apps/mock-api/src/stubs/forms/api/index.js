export default async function (app, opts) {
  app.get("/", (request, reply) => {
    return { something: "else" };
  });
}
