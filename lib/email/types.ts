export type EmailAddress = {
  name?: string;
  address: string;
};

export type EmailMessageSummary = {
  uid: number;
  messageId?: string;
  subject: string;
  from: EmailAddress[];
  to: EmailAddress[];
  receivedAt?: Date;
  seen: boolean;
};

export type EmailConnectionStatus = {
  connected: boolean;
  mailbox: string;
  messageCount: number;
};