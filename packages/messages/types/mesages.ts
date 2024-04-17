export type SecurityLevel = "high" | "medium" | "low";
type Lang = "en" | "ga";

export type TableMessage = {
  id: string;
  organisationId: string;
  threadName?: string;
  lang: Lang;
  isSeen: boolean;
  messageName: string;
  securityLevel: SecurityLevel;
  subject: string;
  excerpt: string;
  richText: string;
  plainText: string;
  links: string[];
  preferredTransports: string[];
  updatedAt?: Date;
  createdAt: Date;
  paymentRequestId?: string;
};

export type TableMessageTemplateVariables = {
  templateId: string;
  fieldName: string;
  fieldType: string;
};

export type TableMessageTemplate = {
  id: string;
  templateName: string;
  createdByUserId: string;
  organisationId: string;
  templateGroupId: string;
  lang: Lang;
  subject: string;
  excerpt: string;
  richText: string;
  plainText: string;
  updatedAt?: Date;
  createdAt: Date;
};
