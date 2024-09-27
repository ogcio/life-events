import fastifyPostgres from "@fastify/postgres";

const getFilename = async (
  pg: fastifyPostgres.PostgresDb,
  inputFilename: string,
  userId: string,
) => {
  const fileExistsQuery = await pg.query(
    `
    SELECT file_name as "fileName"
    FROM files
    WHERE deleted = false AND owner = $1 AND file_name = $2
  `,
    [userId, inputFilename],
  );

  if (!fileExistsQuery.rows.length) {
    return inputFilename;
  }

  let clashingFileExists = true;
  let newIndex = 1;
  let newFilename = "";
  while (clashingFileExists) {
    newFilename = `${inputFilename.slice(0, inputFilename.lastIndexOf("."))}-${newIndex++}${inputFilename.slice(inputFilename.lastIndexOf("."))}`;

    const clashingFileCheckQuery = await pg.query(
      `
    SELECT file_name as "fileName"
    FROM files
    WHERE deleted = false AND owner = $1 AND file_name = $2
  `,
      [userId, newFilename],
    );

    if (!clashingFileCheckQuery.rows.length) {
      clashingFileExists = false;
    }
  }

  return newFilename;
};

export default getFilename;
