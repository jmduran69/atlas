create table public.email_processing_log (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null,

  mailbox text not null,
  email_uid bigint not null,
  message_id text,
  subject text,

  processing_status text not null default 'pending'
    check (
      processing_status in (
        'pending',
        'processed',
        'failed'
      )
    ),

  processing_result text
    check (
      processing_result is null
      or processing_result in (
        'created',
        'updated',
        'unchanged',
        'not-a-meeting'
      )
    ),

  meeting_id uuid
    references public.meetings(id)
    on delete set null,

  error_message text,

  attempt_count integer not null default 0
    check (attempt_count >= 0),

  first_seen_at timestamptz not null default now(),
  last_attempted_at timestamptz,
  processed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint email_processing_log_mailbox_uid_unique
    unique (organization_id, mailbox, email_uid)
);

create index email_processing_log_message_id_idx
  on public.email_processing_log (message_id)
  where message_id is not null;

create index email_processing_log_status_idx
  on public.email_processing_log (
    organization_id,
    processing_status
  );

create index email_processing_log_meeting_id_idx
  on public.email_processing_log (meeting_id)
  where meeting_id is not null;

comment on table public.email_processing_log is
  'Audit and processing state for emails evaluated by Atlas.';

comment on column public.email_processing_log.email_uid is
  'IMAP UID for the message within the configured mailbox.';

comment on column public.email_processing_log.processing_status is
  'Processing lifecycle: pending, processed, or failed.';

comment on column public.email_processing_log.processing_result is
  'Final Atlas decision for successfully processed email.';

comment on column public.email_processing_log.meeting_id is
  'Meeting created, updated, or matched while processing the email, when applicable.';
