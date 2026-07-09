-- Security hardening: preserve graph read/write API while preventing authenticated deletion of shared canon nodes.
-- Live migration applied on project typcvaszcfdpkzbjzuur as harden_graph_destructive_boundaries_v1.
-- Rollback: restore previous graph_delete_node definition from 20260626164633_graph_rpc_boundary.sql if required.

revoke execute on function public.graph_bfs_traversal(text, integer, real) from public, anon, authenticated;
revoke execute on function public.graph_find_resonant(real, integer) from public, anon, authenticated;

create or replace function public.graph_delete_node(p_node_id text)
returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_uid uuid := auth.uid();
  v_deleted int := 0;
begin
  if v_uid is null then
    raise exception 'graph_delete_node requires an authenticated user'
      using errcode = '28000';
  end if;

  -- Shared canon nodes (user_id IS NULL) are protected.
  delete from public.graph_nodes n
  where n.id = p_node_id
    and n.user_id = v_uid;

  get diagnostics v_deleted = row_count;

  if v_deleted = 0 then
    raise exception 'graph node is not owned by authenticated user'
      using errcode = '42501';
  end if;
end;
$function$;

comment on function public.graph_delete_node(text) is 'Deletes only authenticated user-owned graph nodes. Shared canon nodes (user_id NULL) are immutable through this RPC.';
