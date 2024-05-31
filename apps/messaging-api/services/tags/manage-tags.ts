import { PoolClient } from "pg";
import { Tag } from "../../types/usersSchemaDefinitions";

const TAGS_PATH_SEPARATOR = ".";

export const processTagsPerUser = async (params: {
  userId: string;
  tags: string[];
  client: PoolClient;
}) => {
  if (params.tags.length === 0) {
    return;
  }

  const tagsByPath = getAllPaths(params.tags);
  let fromDb = await searchTagsByPath({
    tags: tagsByPath.paths,
    client: params.client,
  });
  const fromDbTagPaths = fromDb.map((tag) => tag.tagPath);
  // get all the paths that do not exist on the db
  const missingTags = tagsByPath.paths.filter(
    (x) => !fromDbTagPaths.includes(x),
  );
  if (missingTags.length > 0) {
    const newTags = await createNonExistentTags({
      tagsByPath: tagsByPath.mapped,
      toCreateTagPaths: missingTags,
      client: params.client,
    });

    fromDb = [...newTags, ...fromDb];
  }

  const toLinkTags = fromDb.filter((t) => params.tags.includes(t.tagPath));

  await linkTagsToUser({
    toLinkTags,
    userId: params.userId,
    client: params.client,
  });
};

const linkTagsToUser = async (params: {
  toLinkTags: Tag[];
  userId: string;
  client: PoolClient;
}) => {
  const toInsertValues: string[] = [];
  const toInsertIndexes: string[] = [];
  let indexCount = 1;

  for (const toCreate of params.toLinkTags) {
    toInsertValues.push(params.userId, toCreate.id);
    toInsertIndexes.push(`($${indexCount++}, $${indexCount++})`);
  }
  await params.client.query(
    `
        INSERT INTO tags_users (user_id, tag_id)
        VALUES ${toInsertIndexes.join(", ")}
        ON CONFLICT (user_id, tag_id)
        DO NOTHING
    `,
    toInsertValues,
  );
};

const getAllPaths = (
  inputPaths: string[],
): {
  mapped: Map<string, { tagName: string; tagPath: string }>;
  paths: string[];
} => {
  const mapped = new Map<string, { tagName: string; tagPath: string }>();
  const allPaths = new Set<string>();
  for (const path of inputPaths) {
    // split the tag path
    // e.g. `country.county.city` becomes [`country`, `county`, `city`]
    const paths = path.split(TAGS_PATH_SEPARATOR);
    const currentPath: string[] = [];
    for (const tagName of paths) {
      // join the tags again one by one
      // 1. `country` 2. `country.county` 3. `country.county.city`
      // to get all the possible values
      currentPath.push(tagName);
      const joinedPath = currentPath.join(TAGS_PATH_SEPARATOR);
      mapped.set(joinedPath, { tagName, tagPath: joinedPath });
      allPaths.add(joinedPath);
    }
  }

  return { mapped, paths: [...allPaths] };
};

const createNonExistentTags = async (params: {
  tagsByPath: Map<string, { tagName: string; tagPath: string }>;
  toCreateTagPaths: string[];
  client: PoolClient;
}): Promise<Tag[]> => {
  const toInsertValues: string[] = [];
  const toInsertIndexes: string[] = [];
  let indexCount = 1;

  for (const toCreate of params.toCreateTagPaths) {
    const mapped = params.tagsByPath.get(toCreate);
    toInsertValues.push(mapped!.tagName, mapped!.tagPath);
    toInsertIndexes.push(`($${indexCount++}, $${indexCount++})`);
  }

  const queryInsert = await params.client.query<Tag>(
    `
        INSERT INTO tags(tag_name, tag_path)
        VALUES ${toInsertIndexes.join(", ")}
        RETURNING id as "id", tag_name as "tagName", tag_path as "tagPath"
    `,
    toInsertValues,
  );

  return queryInsert.rows;
};

const searchTagsByPath = async (params: {
  tags: string[];
  client: PoolClient;
}): Promise<Tag[]> => {
  let tagsIndex = 1;
  const tagsValues = params.tags.map(() => `$${tagsIndex++}`);

  const result = await params.client.query<Tag>(
    `
        SELECT 
            id as "id",
            tag_name as "tagName",
            tag_path as "tagPath"
        FROM tags
        WHERE tag_path in (${tagsValues});
    `,
    [...params.tags],
  );

  return result.rows;
};
