export const generateJourneyLink = (journeyId: string) => {
  const url = new URL(`/journey/${journeyId}`, process.env.HOST_URL);
  return url.href;
};
