export type EmailTemplate = {
  id: string;
};

export type EmailTemplateTranslation = {
  templateId: string;
  language: "EN" | "GA";
  name: string;
  subject: string;
  body: string;
};
