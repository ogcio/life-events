/**
 * The idea of some kind of constant (object freeze if we really want) to avoid a bunch of strings everywhere.
 * To make it easy to use everywhere where we href, the path would be the utility function to get the path. Can probably be done
 * smarter and nicer.
 */

export const routeDefinitions = {
  events: { slug: "events" },
  aboutMe: { slug: "about-me" },
  birth: { slug: "birth" },
  health: { slug: "health" },
  driving: {
    slug: "driving",
    renewLicense: {
      slug: "renew-licence",
      path() {
        return `${routeDefinitions.driving.slug}/${routeDefinitions.driving.renewLicense.slug}`;
      },
    },
  },
  employment: { slug: "employment" },
  business: { slug: "business" },
  housing: { slug: "housing" },
  death: { slug: "death" },
};
