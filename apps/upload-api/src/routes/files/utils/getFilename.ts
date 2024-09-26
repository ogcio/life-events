import fastifyPostgres from "@fastify/postgres";

const getFilename = async (
  pg: fastifyPostgres.PostgresDb,
  filename_: string,
  userId: string,
) => {
  let filename = "";
  let extension = "";

  if (filename_.lastIndexOf(".") > 0) {
    [filename, extension] = filename_.split(".");
    extension = `.${extension}`;
  } else {
    filename = filename_;
  }

  const matchingFilesQuery = await pg.query<{
    filename: string;
    createdAt: string;
  }>(
    `
    SELECT split_part(file_name, '.', 1) as "filename"
    FROM files
    WHERE deleted = false AND owner = $2 AND split_part(file_name, '.', 1) LIKE $1 || '%'  ORDER BY created_at DESC LIMIT 1
  `,
    [filename, userId],
  );

  if (!matchingFilesQuery.rows.length) {
    return `${filename}${extension}`;
  }

  const existingFileName = matchingFilesQuery.rows[0].filename;

  const fileIndex = existingFileName.match(/-(\d+)$/);

  if (fileIndex) {
    return `${filename}-${parseInt(fileIndex[1]) + 1}${extension}`;
  } else {
    return `${filename}-1${extension}`;
  }
};

export default getFilename;
