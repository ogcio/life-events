export default async function (app) {
  app.get("/", async (req, res) => {
    return new Promise((resolve, _reject) => {
      const services = [
        "Pensions and Welfare (Department of  Social Protection)",
        "Road Safety Authority (RSA)",
        "Health Service Executive (HSE)",
        "Department of Finance",
        "Department of Justice",
      ];

      return resolve(services);
    });
  });
}
