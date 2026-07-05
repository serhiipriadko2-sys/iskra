-- Repair live Supabase drift against the runtime voice/metrics contract.
-- Source target:
-- - SIBYL is a valid voice in voice_preferences and chat_history.
-- - metrics_snapshots stores foresight and starts from runtime baseline defaults.
--
-- Data safety:
-- - No user rows are inserted, updated, or deleted.
-- - Existing metrics rows keep their stored values; only column/default metadata changes.
--
-- Branch replay safety:
-- - Some preview branches may replay this migration before the legacy public
--   app tables exist because production schema drift predates migration history.
-- - Guard table-specific repairs so branch creation can continue.

DO $$
BEGIN
  IF to_regclass('public.voice_preferences') IS NOT NULL THEN
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
  END IF;

  IF to_regclass('public.chat_history') IS NOT NULL THEN
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
  END IF;

  IF to_regclass('public.metrics_snapshots') IS NOT NULL THEN
    ALTER TABLE public.metrics_snapshots
      ADD COLUMN IF NOT EXISTS foresight REAL DEFAULT 0;

    ALTER TABLE public.metrics_snapshots
      ALTER COLUMN rhythm SET DEFAULT 60,
      ALTER COLUMN trust SET DEFAULT 0.7,
      ALTER COLUMN clarity SET DEFAULT 0.8,
      ALTER COLUMN chaos SET DEFAULT 0.2,
      ALTER COLUMN foresight SET DEFAULT 0;
  END IF;
END $$;
