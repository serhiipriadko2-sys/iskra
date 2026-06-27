-- Remote migration: 20260509092953 / enable_pg_net_for_iskra_import

create extension if not exists pg_net with schema extensions;
