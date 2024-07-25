export const entitlements = {
  slug: "entitlement",
  drivingLicence: {
    slug: "driving-licence",
    path(id: string) {
      return `${entitlements.slug}/${entitlements.drivingLicence.slug}/${id}`;
    },
  },
  birthCertificate: {
    slug: "birth-certificate",
    path(id: string) {
      return `${entitlements.slug}/${entitlements.birthCertificate.slug}/${id}`;
    },
  },
};

export const logto = {
  slug: "logto",
  login: {
    slug: "login",
    path() {
      return "/login";
    },
  },
  signout: {
    slug: "signout",
    path() {
      return "/signout";
    },
  },
};

export const addresses = {
  slug: "addresses",
  searchAddress: {
    slug: "search-address",
    path() {
      return `${addresses.slug}/${addresses.searchAddress.slug}`;
    },
  },
  editAddress: {
    slug: "edit-address",
    path(id: string) {
      return `${addresses.slug}/${addresses.editAddress.slug}/${id}`;
    },
  },
  removeAddress: {
    slug: "remove-address",
    path(id: string) {
      return `${addresses.slug}/${addresses.removeAddress.slug}/${id}`;
    },
  },
  selectAddress: {
    slug: "select-address",
    path() {
      return `${addresses.slug}/${addresses.selectAddress.slug}`;
    },
  },
  manualAddress: {
    slug: "manual-address",
    path() {
      return `${addresses.slug}/${addresses.manualAddress.slug}`;
    },
  },
  addDetails: {
    slug: "add-details",
    path(id: string) {
      return `${addresses.slug}/${id}/${addresses.addDetails.slug}`;
    },
  },
};
