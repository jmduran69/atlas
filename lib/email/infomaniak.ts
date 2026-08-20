import { ImapFlow } from "imapflow";

import { getEmailConfig } from "./config";
import type {
  EmailAddress,
  EmailConnectionStatus,
  EmailMessageSummary,
} from "./types";

function mapAddresses(
  addresses:
    | Array<{
        name?: string;
        address?: string;
      }>
    | undefined,
): EmailAddress[] {
  if (!addresses) return [];

  return addresses
    .filter((item) => Boolean(item.address))
    .map((item) => ({
      name: item.name || undefined,
      address: item.address as string,
    }));
}

export async function testEmailConnection(): Promise<EmailConnectionStatus> {
  const config = getEmailConfig();

  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.password,
    },
    logger: false,
  });

  try {
    await client.connect();

    const lock = await client.getMailboxLock(config.mailbox, {
      readOnly: true,
    });

    try {
      return {
        connected: true,
        mailbox: config.mailbox,
        messageCount: client.mailbox ? client.mailbox.exists : 0,
      };
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => undefined);
  }
}

export async function getRecentEmails(
  limit = 10,
): Promise<EmailMessageSummary[]> {
  const config = getEmailConfig();

  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.password,
    },
    logger: false,
  });

  try {
    await client.connect();

    const lock = await client.getMailboxLock(config.mailbox, {
      readOnly: true,
    });

    try {
      const totalMessages = client.mailbox ? client.mailbox.exists : 0;

      if (totalMessages === 0) {
        return [];
      }

      const start = Math.max(1, totalMessages - limit + 1);
      const messages: EmailMessageSummary[] = [];

      for await (const message of client.fetch(
        `${start}:*`,
        {
          uid: true,
          envelope: true,
          flags: true,
          internalDate: true,
        },
      )) {
        messages.push({
          uid: message.uid,
          messageId: message.envelope?.messageId || undefined,
          subject: message.envelope?.subject || "(No subject)",
          from: mapAddresses(message.envelope?.from),
          to: mapAddresses(message.envelope?.to),
          receivedAt: message.internalDate
  ? new Date(message.internalDate)
  : undefined,
          seen: message.flags?.has("\\Seen") ?? false,
        });
      }

      return messages.reverse();
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => undefined);
  }
}