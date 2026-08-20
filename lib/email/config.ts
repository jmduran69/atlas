export type EmailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  mailbox: string;
};

export function getEmailConfig(): EmailConfig {
  const host = process.env.EMAIL_IMAP_HOST;
  const port = Number(process.env.EMAIL_IMAP_PORT ?? "993");
  const user = process.env.EMAIL_IMAP_USER;
  const password = process.env.EMAIL_IMAP_PASSWORD;
  const mailbox = process.env.EMAIL_IMAP_MAILBOX ?? "INBOX";

  if (!host) {
    throw new Error("EMAIL_IMAP_HOST is not configured.");
  }

  if (!user) {
    throw new Error("EMAIL_IMAP_USER is not configured.");
  }

  if (!password) {
    throw new Error("EMAIL_IMAP_PASSWORD is not configured.");
  }

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("EMAIL_IMAP_PORT is invalid.");
  }

  return {
    host,
    port,
    secure: true,
    user,
    password,
    mailbox,
  };
}