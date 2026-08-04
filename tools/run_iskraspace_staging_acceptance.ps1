[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^[a-z]{20}$')]
  [string]$StagingProjectRef,

  [Parameter(Mandatory = $true)]
  [ValidatePattern('^[0-9a-f-]{36}$')]
  [string]$StagingBranchId,

  [ValidatePattern('^[a-z]{20}$')]
  [string]$ProductionProjectRef = 'typcvaszcfdpkzbjzuur',

  [ValidatePattern('^[0-9a-f]{40}$')]
  [string]$AcceptanceBaseSha = '0fd486b3ab57237668cd3a253a7db58792119b25'
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$acceptanceEnvNames = @(
  'RUN_STAGING_ACCEPTANCE',
  'ISKRA_STAGING_PROJECT_REF',
  'ISKRA_STAGING_URL',
  'ISKRA_STAGING_PUBLISHABLE_KEY',
  'ISKRA_STAGING_SERVICE_ROLE_KEY',
  'ISKRA_STAGING_USER_A_JWT',
  'ISKRA_STAGING_USER_B_JWT',
  'ISKRA_STAGING_NON_MEMBER_JWT',
  'ISKRA_STAGING_SUSPENDED_MEMBER_JWT',
  'ISKRA_STAGING_ANONYMOUS_DENY_RECEIPT_SHA256',
  'ISKRA_STAGING_EXPIRED_JWT',
  'ISKRA_STAGING_ALLOWED_ORIGIN',
  'ISKRA_STAGING_IP_HMAC_SECRET',
  'ISKRA_STAGING_PRINCIPAL_A_RECEIPT_SHA256',
  'ISKRA_STAGING_PRINCIPAL_B_RECEIPT_SHA256',
  'VITE_E2E_AUTH_BYPASS',
  'ISKRA_ACCEPTANCE_BASE_SHA'
)
$acceptanceEnvSnapshot = @{}
foreach ($name in $acceptanceEnvNames) {
  $current = Get-Item -LiteralPath "Env:$name" -ErrorAction SilentlyContinue
  $acceptanceEnvSnapshot[$name] = @{
    exists = $null -ne $current
    value = if ($null -ne $current) { $current.Value } else { $null }
  }
}

function New-RandomPassword {
  return 'Aa1!' + [guid]::NewGuid().ToString('N') + 'z9!'
}

function Invoke-JsonRequest(
  [string]$Method,
  [string]$Uri,
  [hashtable]$Headers,
  $Body
) {
  $json = if ($null -eq $Body) { $null } else { $Body | ConvertTo-Json -Depth 8 -Compress }
  return Invoke-RestMethod -Method $Method -Uri $Uri -Headers $Headers -ContentType 'application/json' -Body $json
}

function Get-Sha256([string]$Value) {
  $sha = [System.Security.Cryptography.SHA256]::Create()
  try {
    return ([System.BitConverter]::ToString(
      $sha.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($Value))
    )).Replace('-', '').ToLowerInvariant()
  } finally {
    $sha.Dispose()
  }
}

function ConvertTo-Base64Url([byte[]]$Bytes) {
  return [Convert]::ToBase64String($Bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
}

function New-ExpiredJwt([string]$UserId, [string]$Email, [string]$Secret) {
  $header = ConvertTo-Base64Url ([System.Text.Encoding]::UTF8.GetBytes('{"alg":"HS256","typ":"JWT"}'))
  $now = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
  $payloadObject = [ordered]@{
    sub = $UserId
    aud = 'authenticated'
    role = 'authenticated'
    email = $Email
    exp = $now - 120
    iat = $now - 3600
    is_anonymous = $false
  }
  $payload = ConvertTo-Base64Url (
    [System.Text.Encoding]::UTF8.GetBytes(($payloadObject | ConvertTo-Json -Compress))
  )
  $unsigned = "$header.$payload"
  $hmac = New-Object System.Security.Cryptography.HMACSHA256
  try {
    $hmac.Key = [System.Text.Encoding]::UTF8.GetBytes($Secret)
    $signature = ConvertTo-Base64Url (
      $hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($unsigned))
    )
  } finally {
    $hmac.Dispose()
  }
  return "$unsigned.$signature"
}

function Wait-ForPostgrestJwtReadiness(
  [string]$BaseUrl,
  [string]$PublishableKey,
  [string]$Token,
  [string]$Label,
  [int]$TimeoutSeconds = 30
) {
  $deadline = [DateTimeOffset]::UtcNow.AddSeconds($TimeoutSeconds)
  $headers = @{
    apikey = $PublishableKey
    Authorization = "Bearer $Token"
  }

  do {
    try {
      Invoke-WebRequest -Method Get `
        -Uri "$BaseUrl/rest/v1/users?select=id&limit=0" `
        -Headers $headers -UseBasicParsing | Out-Null
      return
    } catch {
      $statusCode = [int]$_.Exception.Response.StatusCode
      $body = ''
      if ($null -ne $_.Exception.Response) {
        $reader = New-Object IO.StreamReader($_.Exception.Response.GetResponseStream())
        try {
          $body = $reader.ReadToEnd()
        } finally {
          $reader.Dispose()
        }
      }
      if ($statusCode -ne 401 -or $body -notmatch 'PGRST303') {
        throw "Disposable principal $Label JWT readiness returned unexpected status $statusCode"
      }
    }
    Start-Sleep -Seconds 1
  } while ([DateTimeOffset]::UtcNow -lt $deadline)

  throw "Disposable principal $Label JWT readiness timed out"
}

Push-Location $repoRoot
try {
  $branch = (
    pnpm dlx supabase@2.109.0 branches get $StagingBranchId `
      --project-ref $ProductionProjectRef --output json
  ) | ConvertFrom-Json
  $baseUrl = $branch.SUPABASE_URL.TrimEnd('/')
  $publishableKey = if ($branch.SUPABASE_PUBLISHABLE_KEY) {
    $branch.SUPABASE_PUBLISHABLE_KEY
  } else {
    $branch.SUPABASE_ANON_KEY
  }
  $serviceRoleKey = $branch.SUPABASE_SERVICE_ROLE_KEY
  if (-not $baseUrl -or -not $publishableKey -or -not $serviceRoleKey -or -not $branch.POSTGRES_URL) {
    throw 'Staging branch credentials are incomplete'
  }
  if ($baseUrl -ne "https://$StagingProjectRef.supabase.co") {
    throw 'Staging branch URL does not match the requested project ref'
  }

  $grantSql = @"
select count(*)::int as forbidden_grant_count
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('graph_nodes', 'graph_edges')
  and grantee in ('PUBLIC', 'anon', 'authenticated')
  and privilege_type in ('TRUNCATE', 'TRIGGER', 'REFERENCES');
"@
  $grantSql = $grantSql -replace '\s+', ' '
  $grantQueryArgs = @(
    'dlx', 'supabase@2.109.0', 'db', 'query', $grantSql,
    '--db-url', $branch.POSTGRES_URL, '--output-format', 'json'
  )
  $grantResult = (& pnpm @grantQueryArgs) | ConvertFrom-Json
  if ($LASTEXITCODE -ne 0 -or -not $grantResult.rows) {
    throw 'Failed to read staging Graph privilege postcondition'
  }
  $forbiddenGrantCount = [int]$grantResult.rows[0].forbidden_grant_count
  if ($forbiddenGrantCount -ne 0) {
    throw "Staging Graph privilege postcondition failed with count $forbiddenGrantCount"
  }
  "GRAPH_FORBIDDEN_CLIENT_GRANT_COUNT=$forbiddenGrantCount"

  $adminHeaders = @{ apikey = $serviceRoleKey; Authorization = "Bearer $serviceRoleKey" }
  $publicHeaders = @{ apikey = $publishableKey }
  $users = @()
  $acceptanceExit = 1
  $cleanupOk = $false
  $anonymousDenyReceipt = ''
  $runTag = [guid]::NewGuid().ToString('N')

  try {
    try {
      $unexpectedAnonymous = Invoke-JsonRequest 'Post' "$baseUrl/auth/v1/signup" $publicHeaders @{
        data = @{ acceptance = $true }
      }
      if ($unexpectedAnonymous.user.id -match '^[0-9a-f-]{36}$') {
        $users += @{ label = 'UNEXPECTED_ANON'; id = $unexpectedAnonymous.user.id }
      }
      throw 'Anonymous signup unexpectedly succeeded on closed-beta staging'
    } catch {
      if ($_.Exception.Message -eq 'Anonymous signup unexpectedly succeeded on closed-beta staging') {
        throw
      }
      $statusCode = [int]$_.Exception.Response.StatusCode
      if ($statusCode -ne 422) {
        throw "Anonymous signup deny returned unexpected status $statusCode"
      }
      $anonymousDenyReceipt = Get-Sha256 'anonymous-signup-denied:422:anonymous_provider_disabled'
      "ANONYMOUS_SIGNUP_DENY_STATUS=$statusCode"
    }

    $specs = @(
      @{ label = 'A'; email = "iskra-acceptance-a-$runTag@example.invalid"; password = (New-RandomPassword) },
      @{ label = 'B'; email = "iskra-acceptance-b-$runTag@example.invalid"; password = (New-RandomPassword) },
      @{ label = 'N'; email = "iskra-acceptance-n-$runTag@example.invalid"; password = (New-RandomPassword) },
      @{ label = 'S'; email = "iskra-acceptance-s-$runTag@example.invalid"; password = (New-RandomPassword) }
    )
    foreach ($spec in $specs) {
      $created = Invoke-JsonRequest 'Post' "$baseUrl/auth/v1/admin/users" $adminHeaders @{
        email = $spec.email
        password = $spec.password
        email_confirm = $true
        user_metadata = @{ acceptance = $true }
      }
      if ($created.id -notmatch '^[0-9a-f-]{36}$') {
        throw "Disposable principal $($spec.label) creation returned no UUID"
      }
      $spec.id = $created.id
      $users += $spec
    }
    foreach ($spec in $specs) {
      $session = Invoke-JsonRequest 'Post' "$baseUrl/auth/v1/token?grant_type=password" $publicHeaders @{
        email = $spec.email
        password = $spec.password
      }
      if (-not $session.access_token) {
        throw "Disposable principal $($spec.label) sign-in returned no JWT"
      }
      $spec.token = $session.access_token
    }
    foreach ($spec in $specs) {
      Wait-ForPostgrestJwtReadiness $baseUrl $publishableKey $spec.token $spec.label
    }

    $a = $specs | Where-Object label -eq 'A'
    $b = $specs | Where-Object label -eq 'B'
    $n = $specs | Where-Object label -eq 'N'
    $s = $specs | Where-Object label -eq 'S'
    foreach ($id in @($a.id, $b.id, $n.id, $s.id)) {
      if ($id -notmatch '^[0-9a-f-]{36}$') {
        throw 'Unsafe fixture UUID'
      }
    }

    $membershipSql = @"
insert into private.beta_members (user_id,status)
values
  ('$($a.id)'::uuid,'active'),
  ('$($b.id)'::uuid,'active'),
  ('$($s.id)'::uuid,'suspended');
"@
    $membershipSql = $membershipSql -replace '\s+', ' '
    $queryArgs = @(
      'dlx', 'supabase@2.109.0', 'db', 'query', $membershipSql,
      '--db-url', $branch.POSTGRES_URL, '--output-format', 'json'
    )
    & pnpm @queryArgs | Out-Null
    if ($LASTEXITCODE -ne 0) {
      throw 'Failed to create staging membership fixtures'
    }

    $hmacBytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
      $rng.GetBytes($hmacBytes)
    } finally {
      $rng.Dispose()
    }
    $acceptanceHmac = ([System.BitConverter]::ToString($hmacBytes)).Replace('-', '').ToLowerInvariant()

    $env:RUN_STAGING_ACCEPTANCE = 'true'
    $env:ISKRA_STAGING_PROJECT_REF = $StagingProjectRef
    $env:ISKRA_STAGING_URL = $baseUrl
    $env:ISKRA_STAGING_PUBLISHABLE_KEY = $publishableKey
    $env:ISKRA_STAGING_SERVICE_ROLE_KEY = $serviceRoleKey
    $env:ISKRA_STAGING_USER_A_JWT = $a.token
    $env:ISKRA_STAGING_USER_B_JWT = $b.token
    $env:ISKRA_STAGING_NON_MEMBER_JWT = $n.token
    $env:ISKRA_STAGING_SUSPENDED_MEMBER_JWT = $s.token
    $env:ISKRA_STAGING_ANONYMOUS_DENY_RECEIPT_SHA256 = $anonymousDenyReceipt
    $env:ISKRA_STAGING_EXPIRED_JWT = New-ExpiredJwt $a.id $a.email $branch.SUPABASE_JWT_SECRET
    $env:ISKRA_STAGING_ALLOWED_ORIGIN = 'http://127.0.0.1:4173'
    $env:ISKRA_STAGING_IP_HMAC_SECRET = $acceptanceHmac
    $env:ISKRA_STAGING_PRINCIPAL_A_RECEIPT_SHA256 = Get-Sha256 "bootstrap:$($a.id)"
    $env:ISKRA_STAGING_PRINCIPAL_B_RECEIPT_SHA256 = Get-Sha256 "bootstrap:$($b.id)"
    $env:VITE_E2E_AUTH_BYPASS = 'false'
    $env:ISKRA_ACCEPTANCE_BASE_SHA = $AcceptanceBaseSha

    pnpm --dir runtime/iskraSpace test:staging:acceptance
    $acceptanceExit = $LASTEXITCODE
    "STAGING_ACCEPTANCE_EXIT=$acceptanceExit"
    'VALID_JWT_PRINCIPAL_COUNT=4'
    'ACTIVE_PRINCIPAL_COUNT=2'
    "ANONYMOUS_DENY_RECEIPT_SHA256=$anonymousDenyReceipt"
    "PRINCIPAL_A_RECEIPT_SHA256=$($env:ISKRA_STAGING_PRINCIPAL_A_RECEIPT_SHA256)"
    "PRINCIPAL_B_RECEIPT_SHA256=$($env:ISKRA_STAGING_PRINCIPAL_B_RECEIPT_SHA256)"
  } finally {
    $safeIds = @(
      $users |
        ForEach-Object { $_.id } |
        Where-Object { $_ -match '^[0-9a-f-]{36}$' }
    )
    if ($safeIds.Count -gt 0) {
      $idList = ($safeIds | ForEach-Object { "'$_'::uuid" }) -join ','
      $memberSubjectList = ($safeIds | ForEach-Object { "'$_'" }) -join ','
      $cleanupSql = @"
with
  deleted_graph_edges as (delete from public.graph_edges where user_id in ($idList) returning 1),
  deleted_graph_nodes as (delete from public.graph_nodes where user_id in ($idList) returning 1),
  deleted_audit as (delete from public.audit_log where user_id in ($idList) returning 1),
  deleted_metrics as (delete from public.metrics_snapshots where user_id in ($idList) returning 1),
  deleted_memory as (delete from public.memory_nodes where user_id in ($idList) returning 1),
  deleted_journal as (delete from public.journal_entries where user_id in ($idList) returning 1),
  deleted_tasks as (delete from public.tasks where user_id in ($idList) returning 1),
  deleted_habits as (delete from public.habits where user_id in ($idList) returning 1),
  deleted_voice as (delete from public.voice_preferences where user_id in ($idList) returning 1),
  deleted_chat as (delete from public.chat_history where user_id in ($idList) returning 1),
  deleted_users as (delete from public.users where id in ($idList) returning 1),
  deleted_member_rate_windows as (
    delete from private.ai_rate_limit_windows
     where scope in ('member_minute','member_day')
       and subject in ($memberSubjectList)
    returning 1
  )
delete from private.beta_members where user_id in ($idList);
"@
      $cleanupSql = $cleanupSql -replace '\s+', ' '
      $queryArgs = @(
        'dlx', 'supabase@2.109.0', 'db', 'query', $cleanupSql,
        '--db-url', $branch.POSTGRES_URL, '--output-format', 'json'
      )
      & pnpm @queryArgs | Out-Null
      $dbCleanupExit = $LASTEXITCODE
      $authCleanupErrors = 0
      foreach ($id in $safeIds) {
        try {
          Invoke-RestMethod -Method Delete -Uri "$baseUrl/auth/v1/admin/users/$id" -Headers $adminHeaders |
            Out-Null
        } catch {
          $authCleanupErrors += 1
        }
      }
      $cleanupOk = $dbCleanupExit -eq 0 -and $authCleanupErrors -eq 0
      "CLEANUP_DB_EXIT=$dbCleanupExit"
      "CLEANUP_AUTH_ERRORS=$authCleanupErrors"
      "CLEANUP_PRINCIPALS=$($safeIds.Count)"
      "CLEANUP_OK=$cleanupOk"
    }
  }

  if ($acceptanceExit -ne 0) {
    throw "Staging acceptance failed with exit $acceptanceExit"
  }
  if (-not $cleanupOk) {
    throw 'Staging acceptance cleanup failed'
  }
} finally {
  try {
    foreach ($name in $acceptanceEnvNames) {
      $previous = $acceptanceEnvSnapshot[$name]
      if ($previous.exists) {
        Set-Item -LiteralPath "Env:$name" -Value $previous.value
      } else {
        Remove-Item -LiteralPath "Env:$name" -ErrorAction SilentlyContinue
      }
    }
  } finally {
    Pop-Location
  }
}
