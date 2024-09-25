import { FastifyInstance } from "fastify";
import { getConfigValue, SCHEDULER_TOKEN } from "../utils/storeConfig.js";
import {
  getExpiredFiles,
  markFilesAsDeleted,
  scheduleExpiredFilesForDeletion,
} from "./metadata/utils/filesMetadata.js";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { FileMetadataType } from "../types/schemaDefinitions.js";
import scheduleCleanupTask from "../utils/scheduleCleanupTask.js";

export default async function scheduler(app: FastifyInstance) {
  app.post<{ Body: { token: string } }>(
    "/",
    { schema: { hide: true } },
    async (request) => {
      const { token } = request.body;

      const expectedSchedulerToken = await getConfigValue(
        app.pg.pool,
        SCHEDULER_TOKEN,
      );

      if (token !== expectedSchedulerToken) {
        return { status: "ok" };
      }

      const now = new Date();

      app.log.info(`Cleanup job running at ${now.toISOString()}`);

      // check if there are files with expired TTL, schedule for deletion
      await scheduleExpiredFilesForDeletion(app.pg.pool, now);

      await scheduleCleanupTask(app);

      const filesToDeleteQueryResult = await getExpiredFiles(app.pg.pool, now);

      if (!filesToDeleteQueryResult.rows.length) {
        return { status: "ok" };
      }

      checkLeftoverFiles(app, filesToDeleteQueryResult.rows);
      const filesToDelete = filesToDeleteQueryResult.rows.slice(0, 100);
      checkStaleUndeletedFiles(app, filesToDelete, now);

      const metadataToMarkAsdeleted = await deleteFilesFromStorage(
        app,
        filesToDelete,
      );

      if (!metadataToMarkAsdeleted.length) {
        return { status: "ok" };
      }

      try {
        await markFilesAsDeleted(app.pg.pool, metadataToMarkAsdeleted);
      } catch (err) {
        app.log.error(err);
      }

      return { status: "ok" };
    },
  );
}

/**
 *
 * Logs if there are leftover files after deletion
 *
 * @param app
 * @param files
 */
const checkLeftoverFiles = (
  app: FastifyInstance,
  files: FileMetadataType[],
) => {
  const exceedingFiles = files.length - 100;
  if (exceedingFiles > 0) {
    app.log.info(`${exceedingFiles} files will be deleted on next iteration`);
  }
};

/**
 * Logs if there are some files that have not been deleted for 3 days
 */
const checkStaleUndeletedFiles = (
  app: FastifyInstance,
  filesToDelete: FileMetadataType[],
  now: Date,
) => {
  let count = 0;
  for (const fileToDelete of filesToDelete) {
    const deletionDate = fileToDelete.scheduledDeletionAt as Date;

    const timeDiff = now.getTime() - deletionDate.getTime();
    const diffInDays = timeDiff / (1000 * 60 * 60 * 24);

    if (diffInDays >= 3) {
      count++;
    }
  }
  if (count > 0) {
    app.log.info(`${count} files were not deleting for at least 3 days`);
  }
};

/**
 *
 * Deletes files from storage and returns the list of Ids of metadata
 * to mark as deleted
 *
 * @param app
 * @param filesToDelete
 * @returns
 */
const deleteFilesFromStorage = async (
  app: FastifyInstance,
  filesToDelete: FileMetadataType[],
) => {
  const storageKeysToDelete: { Key: string }[] = [];
  const metaDataToDelete = new Set<string>();

  for (const { id, key } of filesToDelete) {
    storageKeysToDelete.push({ Key: key });
    metaDataToDelete.add(id as string);
  }

  try {
    const response = await app.s3Client.client.send(
      new DeleteObjectsCommand({
        Bucket: app.s3Client.bucketName,
        Delete: {
          Objects: storageKeysToDelete,
        },
      }),
    );

    if (response.Errors) {
      for (const { Code, Key, Message } of response.Errors) {
        app.log.error(`${Code} ${Key} ${Message}`);

        // remove from the metadata to remove
        const fileToDelete = filesToDelete.find(({ key }) => key === Key);
        metaDataToDelete.delete(fileToDelete?.id as string);
      }
    }
  } catch (err) {
    app.log.error(err);
    return [] as string[];
  }

  return Array.from(metaDataToDelete.keys());
};
