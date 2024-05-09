/**
 * The idea of some kind of constant (object freeze if we really want) to avoid a bunch of strings everywhere.
 * To make it easy to use everywhere where we href, the path would be the utility function to get the path. Can probably be done
 * smarter and nicer.
 */

export const routeDefinitions = {
  paymentSetup: {
    slug: "paymentSetup",
    path() {
      return `/${routeDefinitions.paymentSetup.slug}`;
    },
    create: {
      slug: "create",
      path() {
        return `/${routeDefinitions.paymentSetup.slug}/${routeDefinitions.paymentSetup.create.slug}`;
      },
    },
    createComplete: {
      slug: "create",
      path(requestId: string) {
        return `/${routeDefinitions.paymentSetup.slug}/${routeDefinitions.paymentSetup.createComplete.slug}/${requestId}`;
      },
    },
  },
  paymentRequest: {
    slug: "paymentRequest",
    pay: {
      slug: "pay",
      path() {
        return `${routeDefinitions.paymentRequest.slug}/${routeDefinitions.paymentRequest.pay.slug}`;
      },
    },
    complete: {
      slug: "complete",
      path() {
        return `${routeDefinitions.paymentRequest.slug}/${routeDefinitions.paymentRequest.complete.slug}`;
      },
    },
    error: {
      slug: "error",
      path() {
        return `${routeDefinitions.paymentRequest.slug}/${routeDefinitions.paymentRequest.error.slug}`;
      },
    },
  },
  featureFlags: {
    slug: "featureFlags",
    path() {
      return `/${routeDefinitions.featureFlags.slug}`;
    },
  },
  citizen: {
    slug: "citizen",
    path() {
      return `${routeDefinitions.citizen.slug}`;
    },
    transactions: {
      slug: "transactions",
      path() {
        return `${routeDefinitions.citizen.slug}/${routeDefinitions.citizen.transactions.slug}`;
      },
    },
    transactionDetails: {
      slug: "transactionDetails",
      path(transactionId: string) {
        return `${routeDefinitions.citizen.slug}/${routeDefinitions.citizen.transactions.slug}/${transactionId}`;
      },
    },
  },
  info: {
    slug: "info",
    path() {
      return `/${routeDefinitions.info.slug}`;
    },
  },
};
