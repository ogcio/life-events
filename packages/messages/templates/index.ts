import { pgpool } from "../dbConnection";
import { MailData, Template, send } from "..";
import { buildMessage } from "./utils";

export const deleteTemplate = (id: string) =>
  pgpool.query("DELETE FROM templates WHERE id = $1", [id]);

export const getTemplates = async () =>
  (await pgpool.query<Template>(`SELECT * FROM templates`)).rows;

export const editTemplate = (
  id: string,
  name: string,
  subject: string,
  body: string
) =>
  pgpool.query(
    "UPDATE templates SET name = $2, subject = $3, body = $4 WHERE id = $1",
    [id, name, subject, body]
  );

export const addTemplate = (name: string, subject: string, body: string) =>
  pgpool.query(
    "INSERT INTO templates (name, subject, body) VALUES ($1, $2, $3)",
    [name, subject, body]
  );

export const getTemplateById = async (id) =>
  (await pgpool.query<Template>(`SELECT * FROM templates WHERE id= $1`, [id]))
    .rows[0];

export const buildFromTemplate = async (
  templateId: string,
  params: Record<string, any>
) => {
  const template = await getTemplateById(templateId);
  return buildMessage(template.body, params);
};

export const sendFromTemplate = async (
  emailData: Omit<MailData, "subject">, //Taking the subject from the template
  templateId: string,
  params: Record<string, any>
) => {
  const template = await getTemplateById(templateId);
  const body = buildMessage(template.body, params);

  await send({ ...emailData, text: body, subject: template.subject });

  pgpool.query(
    "INSERT INTO messages (fromEmail, toEmail, subject, body, status, workflow_id) VALUES ($1, $2, $3, $4, $5, $6)",
    [emailData.from, emailData.to, template.subject, body, "SENT", "1234"]
  );
};
