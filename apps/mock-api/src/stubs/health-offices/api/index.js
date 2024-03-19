import { faker } from "@faker-js/faker";

export default async function (app) {
  app.get("/", async () => {
    const healthOffices = [...new Array(10)].map(
      () => `${faker.location.city()} Health Office`,
    );
    return healthOffices;
  });
}
