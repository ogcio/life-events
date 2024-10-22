import fastifyPostgres from "@fastify/postgres";

const isFilenameAlreadyPresent = async (
  pg: fastifyPostgres.PostgresDb,
  userId: string,
  filename: string,
) => {
  const clashingFileCheckQuery = await pg.query(
    `
    SELECT file_name as "fileName"
    FROM files
    WHERE deleted = false AND owner = $1 AND file_name = $2
  `,
    [userId, filename],
  );

  return clashingFileCheckQuery.rows.length > 0;
};

const getFilename = async (
  pg: fastifyPostgres.PostgresDb,
  inputFilename: string,
  userId: string,
) => {
  const fileExists = await isFilenameAlreadyPresent(pg, userId, inputFilename);

  if (!fileExists) {
    return inputFilename;
  }

  let clashingFileExists = true;
  let newIndex = 1;
  let newFilename = "";
  while (clashingFileExists) {
    newFilename = `${inputFilename.slice(0, inputFilename.lastIndexOf("."))}-${newIndex++}${inputFilename.slice(inputFilename.lastIndexOf("."))}`;

    const fileExists = await isFilenameAlreadyPresent(pg, userId, newFilename);

    if (!fileExists) {
      clashingFileExists = false;
    }
  }

  return newFilename;
};

export default getFilename;
