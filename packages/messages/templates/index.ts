import { pgpool } from "../dbConnection";
import { MailData, EmailTemplateTranslation } from "..";

export const deleteEmailTemplate = (id: string) =>
  pgpool.query("DELETE FROM email_templates WHERE id = $1", [id]);

export const getEmailTemplates = async (language: string) => {
  const templates = (
    await pgpool.query(
      `
        SELECT t.id, tt.language, tt.name, tt.subject, tt.body
        FROM email_templates t
        INNER JOIN email_template_translations tt ON t.id = tt.template_id
        WHERE tt.language = $1
      `,
      [language],
    )
  ).rows;
  return templates;
};

export const editEmailTemplate = async (
  templateId: string,
  translations: Omit<EmailTemplateTranslation, "templateId">[],
) => {
  const transaction = await pgpool.connect();
  try {
    await transaction.query("BEGIN");

    for (const translation of translations) {
      await transaction.query(
        `
        UPDATE email_template_translations
        SET name = $2, subject = $3, body = $4
        WHERE template_id = $1 AND language = $5
      `,
        [
          templateId,
          translation.name,
          translation.subject,
          translation.body,
          translation.language,
        ],
      );
    }

    await transaction.query("COMMIT");
  } catch (error) {
    await transaction.query("ROLLBACK");
    throw error;
  } finally {
    transaction.release();
  }
};

export const addEmailTemplate = async (
  translations: Omit<EmailTemplateTranslation, "templateId">[],
) => {
  const transaction = await pgpool.connect();
  try {
    await transaction.query("BEGIN");

    const templateRes = await transaction.query(`
        INSERT INTO email_templates DEFAULT VALUES RETURNING id
      `);
    const templateId = templateRes.rows[0].id;

    for (const translation of translations) {
      await transaction.query(
        `
          INSERT INTO email_template_translations (template_id, language, name, subject, body)
          VALUES ($1, $2, $3, $4, $5)
        `,
        [
          templateId,
          translation.language,
          translation.name,
          translation.subject,
          translation.body,
        ],
      );
    }

    await transaction.query("COMMIT");
    return templateId;
  } catch (error) {
    await transaction.query("ROLLBACK");
    throw error;
  } finally {
    transaction.release();
  }
};

export const getEmailTemplateById = async (id: string) => {
  const translationsRes = await pgpool.query(
    `
    SELECT tt.language, tt.name, tt.subject, tt.body
    FROM messages.email_template_translations tt
    WHERE tt.template_id = $1
  `,
    [id],
  );

  return {
    id,
    template_translations: translationsRes.rows.map((translation) => ({
      language: translation.language,
      name: translation.name,
      subject: translation.subject,
      body: translation.body,
    })),
  };
};

export const buildFromEmailTemplate = async (
  templateId: string,
  params: Record<string, any>,
) => {
  //TODO: To reimplement after the final schema has been defined
};

export const sendFromEmailTemplate = async (
  emailData: Omit<MailData, "subject">, //Taking the subject from the template
  templateId: string,
  params: Record<string, any>,
) => {
  //TODO: To reimplement after the final schema has been defined
};
