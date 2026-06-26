-- Repair live Supabase drift against the runtime voice/metrics contract.
-- Source target:
-- - SIBYL is a valid voice in voice_preferences and chat_history.
-- - metrics_snapshots stores foresight and starts from runtime baseline defaults.
--
-- Data safety:
-- - No user rows are inserted, updated, or deleted.
-- - Existing metrics rows keep their stored values; only column/default metadata changes.

ALTER TABLE public.voice_preferences
  DROP CONSTRAINT IF EXISTS voice_preferences_voice_name_check;

ALTER TABLE public.voice_preferences
  ADD CONSTRAINT voice_preferences_voice_name_check
  CHECK (
    voice_name = ANY (
      ARRAY[
        'KAIN'::text,
        'PINO'::text,
        'SAM'::text,
        'ANHANTRA'::text,
        'HUYNDUN'::text,
        'ISKRIV'::text,
        'ISKRA'::text,
        'MAKI'::text,
        'SIBYL'::text
      ]
    )
  );

ALTER TABLE public.chat_history
  DROP CONSTRAINT IF EXISTS chat_history_voice_name_check;

ALTER TABLE public.chat_history
  ADD CONSTRAINT chat_history_voice_name_check
  CHECK (
    voice_name = ANY (
      ARRAY[
        'KAIN'::text,
        'PINO'::text,
        'SAM'::text,
        'ANHANTRA'::text,
        'HUYNDUN'::text,
        'ISKRIV'::text,
        'ISKRA'::text,
        'MAKI'::text,
        'SIBYL'::text
      ]
    )
  );

ALTER TABLE public.metrics_snapshots
  ADD COLUMN IF NOT EXISTS foresight REAL DEFAULT 0;

ALTER TABLE public.metrics_snapshots
  ALTER COLUMN rhythm SET DEFAULT 60,
  ALTER COLUMN trust SET DEFAULT 0.7,
  ALTER COLUMN clarity SET DEFAULT 0.8,
  ALTER COLUMN chaos SET DEFAULT 0.2,
  ALTER COLUMN foresight SET DEFAULT 0;
