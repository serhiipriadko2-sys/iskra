# Supabase Security Best Practices

> Этот документ является частью слоя *system* и призван помочь разработчикам
> IskraSpace правильно настраивать и эксплуатировать Supabase. Он основан на
> рекомендациях сообщества и внутренних аудитов. Воспринимайте его как
> живой чеклист: обновляйте, когда появляются новые практики.

## 0. Current Iskra Live Priorities

[FACT] Проверка live проекта `AgiIskra` на 2026-05-28 выявила несколько практических приоритетов:
- permissive RLS на части `public.*` tables
- GraphQL visibility для `anon` и `authenticated` там, где она не нужна
- публично вызываемые `SECURITY DEFINER` RPC
- слишком широкий privileged surface в `db-proxy`
- public invoke у import/backfill/diagnostic Edge Functions
- drift между repo assumptions и live embedding/retrieval surface

Рабочие артефакты для этого прохода:
- `docs/operations/sprint1_remediation_matrix.md`
- `docs/architecture/ARCHITECTURE_TRUTH_BOUNDARY_v1.md`
- `governance/adr_20260528_embedding_standard_v1.md`
- `docs/security/db_proxy_decision_v1.md`
- `docs/operations/sprint2_implementation_backlog.md`

## 1. Включайте Row Level Security (RLS)

- **Включите RLS для каждой таблицы.** По умолчанию Supabase таблицы
  наследуют режим RLS, но если вы создаёте таблицы вручную, убедитесь,
  что `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` включён.
- **Пишите простые политики RLS.** Политика должна быть настолько проста,
  насколько это возможно: например, разрешать доступ пользователю только к
  своим записям или записям с общим `workspace_id`. Сложные выражения
  усложняют аудит и увеличивают риск ошибок.
- **Не оставляйте permissive placeholders в production.** Always-true policies должны считаться временной аварийной мерой, а не рабочим состоянием.

## 2. Никогда не используйте `service_role` ключ на клиенте

- `service_role` имеет полный доступ к базе данных; он предназначен для
  безопасного серверного окружения (например, Edge Function). **Никогда не
  помещайте `service_role` в браузер или React Native.** Вместо этого
  используйте **анонимный (anon) ключ**. Это ограниченный токен, который
  действует только в рамках RLS.
- Храните ключи в переменных окружения (`.env`) и **не коммитте их** в
  репозиторий. Регулярно их обновляйте и ограничивайте время жизни.
- Любой generic proxy поверх `service_role` должен считаться risky-by-default. См. `docs/security/db_proxy_decision_v1.md`.

## 3. Используйте Supabase Auth и минимизируйте права анона

- Для большинства сценариев достаточно авторизованных пользователей. Настройте
  Supabase Auth и используйте JWT-токены для идентификации.
- Политики RLS должны различать `authenticated` и `anonymous` роли и
  предоставлять минимум доступа для анонимов. Например, анонимному
  пользователю можно разрешить только чтение публичных данных.
- Если объект не должен быть discoverable до sign-in, отзывайте не только строки через RLS, но и лишний `SELECT`, чтобы он исчезал из GraphQL/Data API surface.

## 4. Ограничивайте частоту запросов и атак

- Для Edge Functions включайте защиту от злоупотребления (rate limiting).
  Supabase публикует пример rate limiting через Redis (Upstash) и рекомендует
  лимитировать по user id из Supabase Auth.
- Применяйте ограничения на количество регистраций и восстановлений
  пароля в единицу времени.
- Internal rate-limiting tables и helper RPC не должны быть публично discoverable без сильной причины.

## 5. Обеспечьте сетевую безопасность

- **Включите SSL (https)** для всех соединений. Supabase предоставляет
  сертификаты автоматически; используйте их.
- **Ограничьте IP-адреса**, откуда разрешены соединения к вашей базе данных.
  Supabase позволяет настроить список разрешённых IP. Это особенно важно
  для сервисов, которые обращаются к базе напрямую.
- Используйте VPN или private networking, если у вас есть чувствительные
  сервисы, которые должны быть доступны только из вашего VPC.

## 6. Проектируйте схему базы данных осознанно

- Создавайте необходимые индексы и правильно выбирайте типы данных. Это
  напрямую влияет на производительность и нагрузку.
- Для многопользовательских приложений предпочитайте **многоэкземплярную
  схему** (multi-tenant), где каждая таблица имеет `workspace_id`/`user_id` и
  фильтруется RLS. Это проще и безопаснее, чем создание отдельных
  схем/баз для каждого клиента.
- Разделяйте hot и cold данные (например, архивные логи можно вынести в
  отдельную таблицу/хранилище).
- Для Iskra отдельно различайте `public` app-state и `iskra` canon-state. См. `docs/architecture/ARCHITECTURE_TRUTH_BOUNDARY_v1.md`.

## 7. Управляйте realtime‑подписками

- Не подписывайтесь на все изменения в таблицах; ограничивайте
  подписку по `channel` и `broadcast` только нужными событиями.
- Подписывайтесь только на те таблицы и каналы, которые действительно
  отображаются в UI. Это уменьшит нагрузку и улучшит масштабируемость.

## 8. Edge Functions (особенно embeddings)

Минимальный security‑контур для функций типа `embed`:

1) **Auth обязателен.** Функция должна требовать `Authorization: Bearer ...`.
2) **CORS preflight.** Для вызовов из браузера обрабатывайте `OPTIONS`.
3) **Rate limiting.** Включайте лимиты (в идеале — через внешнее атомарное хранилище).
4) **PII‑контур.** Не отправляйте явные персональные данные в embeddings без политики.
5) **Секреты.** `service_role` — только сервер/Edge, никогда в браузер.

Техническая привязка к репо:

- `supabase/config.toml` фиксирует `verify_jwt=true` для `embed`.
- `supabase/functions/embed/index.ts` обрабатывает `OPTIONS`, требует bearer‑token
  и (опционально) включает best‑effort rate limiting через env.
- `packages/engine/src/services/safeEmbeddings.ts` даёт input‑hygiene+PII policy+cache.
- Canon import/backfill/diagnostic functions не должны оставаться публично вызываемыми после bootstrap.

## 9. Truth-Boundary Security Rules for Iskra

1. `public.*` = user/app state, auth-scoped by default.
2. `iskra.*` = canon-memory and retrieval domain, server-side write path only.
3. Public executable `SECURITY DEFINER` functions are disallowed unless explicitly justified.
4. Generic service-role HTTP proxies are disallowed as a steady-state architecture.
5. Embedding model/dimension drift is a security and reliability problem, not just a quality problem.

## Источники

### Supabase docs (primary)

- Functions auth & security: требование Authorization и подходы защиты.
- Function config: `verify_jwt` как переключатель поведения.
- CORS: необходимость обработки OPTIONS при вызове из браузера.
- Rate limiting example: Upstash Redis.

### Internal (Iskra)

- `system/security.md` (no secrets) + `system/workflow_ops.md` (QA gates).
- `docs/operations/sprint1_remediation_matrix.md`
- `docs/security/db_proxy_decision_v1.md`
