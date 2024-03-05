export type Notification = {
  id: string;
  subject: string;
  action: string;
  actionUrl: string;
  type: string;
  createdAt: Date;
  read: boolean;
};
