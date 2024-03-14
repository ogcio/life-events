import { pgpool } from "../dbConnection";
import { Notification } from "../types";

export const buildNotificationService = (userId: string) => {
  const getNotifications = async (subjectSearch?: string) => {
    let query = `
      SELECT *, created_at AS "createdAt", action_url AS "actionUrl"
      FROM notifications
      WHERE user_id = $1
    `;

    const queryParams = [userId];

    if (subjectSearch) {
      query += ` AND subject ILIKE $2`;
      queryParams.push(`%${subjectSearch}%`);
    }

    return (await pgpool.query<Notification>(query, queryParams)).rows;
  };

  const getUnreadNotificationsCount = async () => {
    const { rows } = await pgpool.query(
      `
    SELECT COUNT(*) FROM notifications
    WHERE user_id = $1 AND read = FALSE;
  `,
      [userId],
    );
    return rows[0].count;
  };

  const markNotificationAsRead = (notificationId: string) =>
    pgpool.query(
      `
  UPDATE notifications
  SET read = TRUE
  WHERE id = $1 AND user_id = $2;
`,
      [notificationId, userId],
    );

  const createNotification = async ({
    subject,
    action,
    actionUrl,
    type,
    createdAt,
    read = false, // default value if not provided
  }) => {
    return pgpool.query(
      `
        INSERT INTO notifications
        (subject, action, action_url, type, created_at, read, user_id)
        VALUES
        ($1, $2, $3, $4, $5, $6, $7)`,
      [subject, action, actionUrl, type, createdAt, read, userId],
    );
  };

  return {
    getUnreadNotificationsCount,
    getNotifications,
    markNotificationAsRead,
    createNotification,
  };
};
