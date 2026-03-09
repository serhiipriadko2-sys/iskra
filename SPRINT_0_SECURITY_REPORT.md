# ISKRA SPRINT 0 - SECURITY LOCKDOWN
## Implementation Report

**Date**: 2026-03-07  
**Status**: ✅ COMPLETE (Critical & High Priority Items)  
**Engineer**: Искра-Кодер vΩ.6

---

## 📋 ЗАДАЧИ СПРИНТА 0

### ✅ Задача 0.1: Исправить RLS (CRITICAL)
**Цель**: Заменить `USING (true)` на `auth.uid() = user_id`

**Выполнено**:
- Создана миграция: `supabase/migrations/20260307_fix_rls_policies.sql`
- Создан скрипт миграции данных: `supabase/migrations/README_LEGACY_DATA_MIGRATION.sql`

**Файлы**:
```
/workspace/supabase/migrations/20260307_fix_rls_policies.sql
  - SHA256: f617c3da6174247949cbff106c723a0f9210821ca20b501273241573ac7f9cdd
  - Lines: 152
  - Size: ~5.2KB

/workspace/supabase/migrations/README_LEGACY_DATA_MIGRATION.sql
  - SHA256: [auto-generated on save]
  - Lines: 137
  - Purpose: Миграция legacy data с device_id на auth.uid()
```

**Что делает миграция**:
1. Drop всех insecure политик с `USING (true)`
2. Create новых secure политик с `auth.uid() = user_id`
3. Grant full access для `service_role` (для background jobs)
4. Verification queries для проверки после деплоя

**⚠️ Критические замечания**:
- Migration BREAKS доступ для данных без valid `auth.uid()`
- Если есть legacy data (device_id), нужно запустить migration script ДО деплоя
- Требуется проверка: есть ли в продакшене пользователи с device_id?

**Следующие шаги**:
1. Проверить Supabase Dashboard на наличие legacy data
2. Populate mapping table `device_user_mapping` если нужно
3. Deploy migration через Supabase Dashboard SQL Editor
4. Run verification queries

---

### ✅ Задача 0.2: Исправить CSP (HIGH)
**Цель**: Удалить `'unsafe-inline'` и `'unsafe-eval'`

**Выполнено**:
- Обновлён: `nginx.conf`

**Изменения**:
```diff
- script-src 'self' 'unsafe-inline' 'unsafe-eval'
+ script-src 'self'

- Referrer-Policy: no-referrer-when-downgrade
+ Referrer-Policy: strict-origin-when-cross-origin

+ Permissions-Policy: geolocation=(), microphone=(), camera=()
+ frame-ancestors 'none'
+ base-uri 'self'
+ form-action 'self'
```

**Файл**:
```
/workspace/nginx.conf
  - SHA256: f8458b6786b7ccf0eace9292cfa5f0dd959646522e7bc4f1944f7e51347bbf93
  - Lines: 39
```

**⚠️ Breaking Changes**:
- Удалён `'unsafe-eval'` — может сломать библиотеки использующие `eval()`
- Удалён `'unsafe-inline'` из script-src — inline скрипты не будут работать
- Если в HTML есть inline `<script>`, нужно:
  - Либо вынести в отдельные файлы
  - Либо добавить hash: `'sha256-<hash>'`

**Следующие шаги**:
1. Протестировать сборку apps/iskra-web
2. Проверить console на CSP violations
3. Если есть inline scripts — добавить hashes или рефакторить

---

### ✅ Задача 0.3: Добавить Auth в Gemini Edge Function (MEDIUM)
**Цель**: Проверка `Authorization: Bearer <JWT>`

**Выполнено**:
- Обновлён: `runtime/iskraSpace/supabase/functions/gemini/index.ts`

**Новая функциональность**:
1. **JWT Verification** — проверка токена через Supabase Auth
2. **Rate Limiting** — 30 запросов/минуту на пользователя (in-memory)
3. **Error Handling** — разные статус коды (401, 429, 500)

**Файл**:
```
/workspace/runtime/iskraSpace/supabase/functions/gemini/index.ts
  - SHA256: 683b14dbeee7f7a2d80b450c5b55104370f455af729ec808c637c96321146aa0
  - Lines: 189
```

**Код аутентификации**:
```typescript
async function verifyAuth(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }
  // ... validate JWT via Supabase client
}
```

**Переменные окружения (требуется в Supabase Dashboard)**:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

**Следующие шаги**:
1. Deploy edge function: `supabase functions deploy gemini`
2. Update client code для отправки `Authorization: Bearer <token>`
3. Test rate limiting

---

### ✅ Задача 0.4: Стандартизировать .env.example (LOW)
**Цель**: Создать `/workspace/apps/iskra-web/.env.example`

**Выполнено**:
- Создан: `apps/iskra-web/.env.example`

**Файл**:
```
/workspace/apps/iskra-web/.env.example
  - SHA256: 5d1a1dc17cea233b663b48ed4ad3112aa43483067f7e64276d980fc960c7a04f
  - Lines: 40
```

**Содержание**:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- Optional: Sentry, PostHog, feature flags
- Security notes

---

## 📊 ИТОГИ СПРИНТА 0

### Изменённые файлы:
| Файл | Статус | SHA256 |
|------|--------|--------|
| `supabase/migrations/20260307_fix_rls_policies.sql` | ✅ Created | f617c3da... |
| `supabase/migrations/README_LEGACY_DATA_MIGRATION.sql` | ✅ Created | auto-gen |
| `runtime/iskraSpace/supabase/functions/gemini/index.ts` | ✅ Updated | 683b14db... |
| `nginx.conf` | ✅ Updated | f8458b67... |
| `apps/iskra-web/.env.example` | ✅ Created | 5d1a1dc1... |

### Команды для деплоя:
```bash
# 1. RLS Migration (через Supabase Dashboard SQL Editor)
# Скопировать содержимое supabase/migrations/20260307_fix_rls_policies.sql

# 2. Deploy Gemini Edge Function
cd /workspace
supabase functions deploy gemini --project-ref your-project-ref

# 3. Reload nginx (если используется Docker)
docker restart iskra-nginx

# 4. Verify CSP
curl -I https://your-domain.com | grep Content-Security-Policy
```

### Риски и замечания:
1. **RLS Migration** — может сломать доступ к legacy data
2. **CSP Changes** — может сломать inline scripts
3. **Gemini Auth** — требует обновления client code

### Что осталось (не вошло в Sprint 0):
- Secrets sweep (скан на секреты в репе)
- Ledger auto-verify hook
- TypeScript Project References
- Strangler Fig migration (runtime → packages)

---

## PASS/FAIL

**PASS** ✅

Все 4 задачи Спринта 0 выполнены:
- ✅ RLS migration created
- ✅ CSP hardened (removed unsafe-inline/unsafe-eval)
- ✅ Gemini function secured with JWT + rate limiting
- ✅ .env.example standardized

**Требует подтверждения перед деплоем**:
1. Есть ли legacy data в продакшене? (нужна ли data migration?)
2. Готовы ли к breaking changes CSP?
3. Обновлён ли client code для отправки Authorization header?

---

## ∆DΩΛ

**∆**: Спринт 0 завершён. Критические уязвимости исправлены на уровне кода.  
**D**: Миграции RLS, hardened CSP, secured Gemini function, standardized env.  
**Ω**: 0.92 (высокая уверенность, требуется тестирование в staging).  
**Λ**: Деплой в staging → тестирование → deploy to production.

---

**Семён, жду команду на деплой или дополнительные правки.**
