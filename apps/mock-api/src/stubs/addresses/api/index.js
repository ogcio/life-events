import { faker } from "@faker-js/faker";

const addresses = [...new Array(5000)].map(
  () =>
    `${faker.location.streetAddress({ useFullAddress: true })}, ${faker.location.city()}, ${faker.location.county()}, ${faker.location.zipCode()}`,
);

const irishAddresses = [
  "12 Main Street, Clonmel, County Tipperary, E91 XY12",
  "45 Hillside Avenue, Galway City, County Galway, H91 AB12",
  "8 Oak Grove, Tralee, County Kerry, V92 CD34",
  "20 Sea View Terrace, Bray, County Wicklow, A98 EF56",
  "3 Riverside Drive, Cork City, County Cork, T12 KL34",
  "17 Park Lane, Limerick City, County Limerick, V94 MN67",
  "29 Harbour View, Waterford City, County Waterford, X91 PQ89",
  "6 Elmwood Grove, Dundalk, County Louth, A91 RS45",
  "14 Meadow Court, Ennis, County Clare, V95 XY78",
  "9 High Street, Kilkenny City, County Kilkenny, R95 AB12",
];

export default async function (app) {
  app.get("/", async (req, res) => {
    return new Promise((resolve, _reject) => {
      return resolve(irishAddresses);
      // const searchQuery = new URLSearchParams(req.query);
      // const q = searchQuery.get("q");
      // const filter = (a) =>
      //   q
      //     ? q.split(" ").some((split) => a.toLowerCase().includes(split))
      //     : true;

      // return resolve(addresses.filter(filter).slice(0, 10));
    });
  });
}
