import { PoolClient } from "pg";
import { Tag } from "../../types/usersSchemaDefinitions.js";
import { httpErrors } from "@fastify/sensible";

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
  const tagsFromDb = await insertTags({
    tags: tagsByPath,
    client: params.client,
  });
  // link only the tags requested in params.tags
  const toLinkTags = tagsFromDb.filter((t) => params.tags.includes(t.tagPath));
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
  const tagIdsIndexes: string[] = [];
  let indexCount = 2;
  for (const toCreate of params.toLinkTags) {
    toInsertValues.push(toCreate.id);
    const currentTagIdIndex = indexCount++;
    toInsertIndexes.push(`($1, $${currentTagIdIndex})`);
    tagIdsIndexes.push(`$${currentTagIdIndex}`);
  }

  await params.client.query(
    `
      INSERT INTO tags_users (user_id, tag_id)
      VALUES ${toInsertIndexes.join(", ")}
      ON CONFLICT (user_id, tag_id)
      DO NOTHING 
    `,
    [params.userId, ...toInsertValues],
  );
  const result = await params.client.query(
    `
      SELECT tag_id from tags_users
        where user_id = $1 AND tag_id in (${tagIdsIndexes.join(", ")})
    `,
    [params.userId, ...toInsertValues],
  );

  if (result.rowCount !== params.toLinkTags.length) {
    throw httpErrors.internalServerError("Error linking tags");
  }
};

const getAllPaths = (
  inputPaths: string[],
): Map<string, { tagName: string; tagPath: string }> => {
  const mapped = new Map<string, { tagName: string; tagPath: string }>();
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
    }
  }

  return mapped;
};

const insertTags = async (params: {
  tags: Map<string, { tagName: string; tagPath: string }>;
  client: PoolClient;
}): Promise<Tag[]> => {
  let valuesIndex = 1;
  let itemsCount = 0;
  const valuesClauses: string[] = [];
  const valuesToInsert: string[] = [];
  const tagsValues = params.tags.values();
  for (const tag of tagsValues) {
    itemsCount++;
    valuesClauses.push(`($${valuesIndex++}, $${valuesIndex++})`);
    valuesToInsert.push(tag.tagName, tag.tagPath);
  }
  // why "ON CONFLICT DO UPDATE" ?
  // because in this way the "RETURNING" statement
  // returns the tag even if it already exists
  const result = await params.client.query<Tag>(
    `
      INSERT INTO tags(tag_name, tag_path)
        VALUES ${valuesClauses.join(", ")}
      ON CONFLICT(tag_name, tag_path)
      DO UPDATE SET "tag_name" = tags.tag_name  
      RETURNING id as "id", tag_name as "tagName", tag_path as "tagPath"
    `,
    valuesToInsert,
  );

  if (result.rowCount !== itemsCount) {
    throw httpErrors.internalServerError("Error importing tags");
  }

  return result.rows;
};
