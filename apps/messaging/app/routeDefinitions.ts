/**
 * The idea of some kind of constant (object freeze if we really want) to avoid a bunch of strings everywhere.
 * To make it easy to use everywhere where we href, the path would be the utility function to get the path. Can probably be done
 * smarter and nicer.
 */

export const routeDefinitions = {
  templates: {
    slug: "templates",
    path() {
      return `/${routeDefinitions.templates.slug}`;
    },
  },
};
