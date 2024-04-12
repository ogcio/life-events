export const entitlements = {
  slug: "entitlement",
  drivingLicence: {
    slug: "driving-licence",
    path(id: number) {
      return `${entitlements.slug}/${entitlements.drivingLicence.slug}/${id}`;
    },
  },
  birthCertificate: {
    slug: "birth-certificate",
    path(id: number) {
      return `${entitlements.slug}/${entitlements.birthCertificate.slug}/${id}`;
    },
  },
};

export const addresses = {
  slug: "addresses",
  newAddress: {
    slug: "new-address",
    path() {
      return `${addresses.slug}/${addresses.newAddress.slug}`;
    },
  },
};
