const getTimelineData = (queryParams: URLSearchParams) => {
  return fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/timeline/?${queryParams}`,
  );
};

export default getTimelineData;
