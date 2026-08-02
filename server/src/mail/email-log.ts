export type EmailLogStatus = 'sent' | 'failed' | 'skipped';

export interface EmailLogEntry {
  time: string;
  event: string;
  email: {
    type: string;
    status: EmailLogStatus;
    recipient: string | null;
    messageId?: string | null;
    relatedId?: string | number | null;
  };
}

export function formatTimelineTime(date: Date = new Date()) {
  return date.toLocaleDateString('en-IN') + ' ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function emailLogEntry(opts: {
  type: string;
  recipient?: string | null;
  status: EmailLogStatus;
  messageId?: string | null;
  relatedId?: string | number | null;
}): EmailLogEntry {
  const label =
    opts.status === 'sent'
      ? 'delivered'
      : opts.status === 'failed'
        ? 'failed'
        : 'skipped (no recipient)';
  return {
    time: formatTimelineTime(),
    event: `Email: ${opts.type} ${label}${opts.recipient ? ` to ${opts.recipient}` : ''}`,
    email: {
      type: opts.type,
      status: opts.status,
      recipient: opts.recipient ?? null,
      messageId: opts.messageId ?? null,
      relatedId: opts.relatedId ?? null,
    },
  };
}
