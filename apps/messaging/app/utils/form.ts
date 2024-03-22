export type EmailWithoutTemplateState = {
  subject: string;
  message: string;
  attachmentId: string;
  link: string;
  recipients: string[];
};

export type Error = {
  field: string;
  value: string;
  message: string;
};
