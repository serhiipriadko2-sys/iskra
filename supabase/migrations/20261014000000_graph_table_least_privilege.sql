-- Least-privilege follow-up for the Graph ACL drift observed in the backup.
-- RLS applies to row operations, not TRUNCATE or schema/trigger capabilities.
-- Local rehearsal first; production application requires its own approval.
begin;

revoke truncate, references, trigger
  on table public.graph_nodes, public.graph_edges
  from public, anon, authenticated;

commit;
