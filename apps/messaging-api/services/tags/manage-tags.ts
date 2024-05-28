import { PoolClient } from "pg";
import { Tag } from "../../types/usersSchemaDefinitions";
import { createError } from "@fastify/error";

export const processTagsPerUser = async (params: {
  userId: string;
  tags: string[];
  client: PoolClient;
  createIfNotExists: boolean;
}) => {
  if (params.tags.length === 0) {
    return;
  }

  // explodes all the input tags to get one entry for each
  // valid path. E.g. input tag: country.region.city
  // will return
  // {country: {name: country, path: country}, country.region: {name: region, path: country.region}, ...
  const tagsByPath = getAllPaths(params.tags);
  const allPaths = [...tagsByPath.keys()];
  let fromDb = await searchTagsByPath({
    tags: allPaths,
    client: params.client,
  });
  const fromDbTagPaths = fromDb.map((tag) => tag.tagPath);
  // get all the paths that do not exist on the db
  const missingTags = allPaths.filter((x) => !fromDbTagPaths.includes(x));
  if (missingTags.length > 0) {
    if (!params.createIfNotExists) {
      throw createError(
        "MANAGE_TAGS_ERROR",
        `Following tags do not exist ${missingTags.join(",")}`,
        400,
      );
    }

    const newTags = await createNonExistentTags({
      tagsByPath,
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
): Map<string, { tagName: string; tagPath: string }> => {
  const allPaths = new Map<string, { tagName: string; tagPath: string }>();
  for (const path of inputPaths) {
    const paths = path.split(".");
    const currentPath: string[] = [];
    for (const tagName of paths) {
      currentPath.push(tagName);
      const joinedPath = currentPath.join(".");
      allPaths.set(joinedPath, { tagName, tagPath: joinedPath });
    }
  }

  return allPaths;
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
