-- Staging-first correction for the live/source drift observed after PR #275.
-- It restores the closed-beta graph boundary without changing graph data:
--   * no anonymous/public graph-table reads;
--   * one permissive policy per role/action, plus the existing restrictive
--     beta_membership_required policy;
--   * endpoint ownership checks remain on direct graph-edge writes;
--   * direct client execution of the trigger-only helper is removed;
--   * the four residual auth_rls_initplan policies are normalized.

begin;

revoke all on function public.prevent_graph_node_cross_owner_cascade()
  from public, anon, authenticated, service_role;

drop policy if exists "Users can manage own graph nodes (secure)" on public.graph_nodes;
drop policy if exists graph_nodes_read_public on public.graph_nodes;
drop policy if exists graph_nodes_active_beta_read_visible on public.graph_nodes;
drop policy if exists graph_nodes_active_beta_insert_own on public.graph_nodes;
drop policy if exists graph_nodes_active_beta_update_own on public.graph_nodes;
drop policy if exists graph_nodes_active_beta_delete_own on public.graph_nodes;

create policy graph_nodes_active_beta_read_visible
  on public.graph_nodes for select to authenticated
  using (user_id = (select auth.uid()) or user_id is null);

create policy graph_nodes_active_beta_insert_own
  on public.graph_nodes for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy graph_nodes_active_beta_update_own
  on public.graph_nodes for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy graph_nodes_active_beta_delete_own
  on public.graph_nodes for delete to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users can manage own graph edges (secure)" on public.graph_edges;
drop policy if exists graph_edges_read_public on public.graph_edges;
drop policy if exists graph_edges_active_beta_read_visible on public.graph_edges;
drop policy if exists graph_edges_active_beta_insert_own on public.graph_edges;
drop policy if exists graph_edges_active_beta_update_own on public.graph_edges;
drop policy if exists graph_edges_active_beta_delete_own on public.graph_edges;

create policy graph_edges_active_beta_read_visible
  on public.graph_edges for select to authenticated
  using (user_id = (select auth.uid()) or user_id is null);

create policy graph_edges_active_beta_insert_own
  on public.graph_edges for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.graph_nodes source_node
      where source_node.id = source
        and (source_node.user_id = (select auth.uid()) or source_node.user_id is null)
    )
    and exists (
      select 1 from public.graph_nodes target_node
      where target_node.id = target
        and (target_node.user_id = (select auth.uid()) or target_node.user_id is null)
    )
  );

create policy graph_edges_active_beta_update_own
  on public.graph_edges for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.graph_nodes source_node
      where source_node.id = source
        and (source_node.user_id = (select auth.uid()) or source_node.user_id is null)
    )
    and exists (
      select 1 from public.graph_nodes target_node
      where target_node.id = target
        and (target_node.user_id = (select auth.uid()) or target_node.user_id is null)
    )
  );

create policy graph_edges_active_beta_delete_own
  on public.graph_edges for delete to authenticated
  using (user_id = (select auth.uid()));

alter policy users_select_own on public.users
  using (id = (select auth.uid()));
alter policy users_insert_own on public.users
  with check (id = (select auth.uid()));
alter policy audit_log_select_own on public.audit_log
  using (user_id = (select auth.uid()));
alter policy audit_log_insert_own on public.audit_log
  with check (user_id = (select auth.uid()));

commit;
