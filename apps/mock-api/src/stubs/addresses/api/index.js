import { faker } from "@faker-js/faker";

const addresses = [...new Array(5000)].map(() =>
  faker.location.streetAddress({ useFullAddress: true }),
);

export default async function (app) {
  app.get("/", async (req, res) => {
    return new Promise((resolve, _reject) => {
      const searchQuery = new URLSearchParams(req.query);
      const q = searchQuery.get("q");
      const filter = (a) =>
        q
          ? q.split(" ").some((split) => a.toLowerCase().includes(split))
          : true;

      return resolve(addresses.filter(filter).slice(0, 10));
    });
  });
}
