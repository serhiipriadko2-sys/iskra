# Supabase workflow

Diagnose in this order: environment, auth, schema, RLS, query, client code, edge function logs. Never put service role keys in frontend. For migrations, include rollback or reversible plan when possible.
