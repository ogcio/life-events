import { init, push } from "@socialgouv/matomo-next";

// we export the matomo functions to be able to use them in our app and to avoid having to import
// the matomo library in our app this way we can easily switch to another analytics library if needed

export { push, init };
