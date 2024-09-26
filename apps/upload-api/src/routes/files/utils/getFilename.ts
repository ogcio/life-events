import fastifyPostgres from "@fastify/postgres";

const getFilename = async (
  pg: fastifyPostgres.PostgresDb,
  filename_: string,
  userId: string,
) => {
  let filename = "";
  let extension = "";

  if (filename_.lastIndexOf(".") > 0) {
    filename = filename_.slice(0, filename_.lastIndexOf("."));
    extension = filename_.slice(filename_.lastIndexOf("."));
  } else {
    filename = filename_;
  }

  console.log({ filename, extension });

  const matchingFilesQuery = await pg.query<{
    filename: string;
    createdAt: string;
  }>(
    `
    SELECT file_name as filename
    FROM files
    WHERE deleted = false AND owner = $2 AND substring(file_name from '^(.*).[^.]+$') LIKE $1 || '%'
    ORDER BY created_at DESC LIMIT 1
  `,
    [filename, userId],
  );

  console.log({ match: matchingFilesQuery.rows });

  if (!matchingFilesQuery.rows.length) {
    return `${filename}${extension}`;
  }

  let existingFileName = matchingFilesQuery.rows[0].filename;
  if (existingFileName.lastIndexOf(".") > 0) {
    existingFileName = existingFileName.slice(
      0,
      existingFileName.lastIndexOf("."),
    );
  }

  const fileIndex = existingFileName.match(/-(\d+)$/);

  if (fileIndex) {
    return `${filename}-${parseInt(fileIndex[1]) + 1}${extension}`;
  } else {
    return `${filename}-1${extension}`;
  }
};

export default getFilename;
