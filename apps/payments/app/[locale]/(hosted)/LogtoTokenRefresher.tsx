// temporary workaround to allow Logto to cache the access token
// the token is cached when retrieved in a server action or in a route handler called from the browser
// we have a route at /api/token that retrieves the token
// we call it within an hidden image, so it's called from the browser and the token is cached correctly
// we also added a random query param to avoid caching the image - when the token expires we want the image to be reloaded

export default () => {
  return (
    <img
      src={`${process.env.NEXT_PUBLIC_PAYMENTS_SERVICE_ENTRY_POINT}/api/token?${new Date().getTime()}`}
      style={{ display: "none" }}
    />
  );
};
