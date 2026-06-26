# KateStudio Project Overlay

Use only for KateStudio / K Sebe Yoga Studio.

Truth:
- GitHub repo is desired state for code/docs/workflows/migrations.
- Supabase project is live backend state for schema/RLS/migrations/logs/functions.
- Production URLs are runtime symptoms, not code truth.

Rules:
- Review before code.
- Approval before implementation.
- No secrets.
- Frozen AI contour unless explicitly requested.
- Live Supabase changes without Git migration path are high-risk drift.
