param(
  [Parameter(Mandatory = $true)]
  [string]$RepoUrl,

  [Parameter(Mandatory = $true)]
  [string]$TargetDir,

  [string]$Branch,

  [string]$TokenEnvVar = "GITHUB_TOKEN",

  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Fail($Message) {
  Write-Error $Message
  exit 1
}

function Test-CredentialBearingUrl([string]$Url) {
  return $Url -match "^[a-zA-Z][a-zA-Z0-9+.-]*://[^/\s@]+@"
}

if (Test-CredentialBearingUrl $RepoUrl) {
  Fail "Credential-bearing git URLs are forbidden. Use a token handle such as $TokenEnvVar."
}

if ($RepoUrl -notmatch "^https://github\.com/[^/\s]+/[^/\s]+(\.git)?$") {
  Fail "RepoUrl must be a tokenless GitHub HTTPS URL."
}

$git = Get-Command git -ErrorAction SilentlyContinue
if (-not $git) {
  Fail "git is not available on PATH."
}

$targetParent = Split-Path -Parent ([System.IO.Path]::GetFullPath($TargetDir))
if ($targetParent -and -not (Test-Path -LiteralPath $targetParent)) {
  Fail "Target parent does not exist: $targetParent"
}

$tokenPresent = [bool]([Environment]::GetEnvironmentVariable($TokenEnvVar))

if ($DryRun) {
  [ordered]@{
    status = "DRY_RUN_PASS"
    repo_url = $RepoUrl
    target_dir = [System.IO.Path]::GetFullPath($TargetDir)
    branch = $Branch
    token_handle = $TokenEnvVar
    token_present = $tokenPresent
    secret_in_url = $false
  } | ConvertTo-Json -Depth 4
  exit 0
}

if (Test-Path -LiteralPath $TargetDir) {
  Fail "TargetDir already exists. Refusing to overwrite: $TargetDir"
}

$tempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("iskra-git-askpass-" + [System.Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $tempDir | Out-Null
$askPassPs1 = Join-Path $tempDir "askpass.ps1"
$askPassCmd = Join-Path $tempDir "askpass.cmd"

try {
  @"
param([string]`$Prompt)
if (`$Prompt -match 'Username') {
  [Console]::Out.Write('x-access-token')
  exit 0
}
if (`$Prompt -match 'Password') {
  [Console]::Out.Write([Environment]::GetEnvironmentVariable('$TokenEnvVar'))
  exit 0
}
[Console]::Out.Write('')
"@ | Set-Content -LiteralPath $askPassPs1 -Encoding UTF8

  @"
@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0askpass.ps1" %*
"@ | Set-Content -LiteralPath $askPassCmd -Encoding ASCII

  $oldAskPass = $env:GIT_ASKPASS
  $oldTerminalPrompt = $env:GIT_TERMINAL_PROMPT
  $env:GIT_ASKPASS = $askPassCmd
  $env:GIT_TERMINAL_PROMPT = "0"

  $args = @("clone")
  if ($Branch) {
    $args += @("--branch", $Branch)
  }
  $args += @($RepoUrl, $TargetDir)

  & git @args
  if ($LASTEXITCODE -ne 0) {
    Fail "git clone failed with exit code $LASTEXITCODE"
  }

  Push-Location -LiteralPath $TargetDir
  try {
    & git remote set-url origin $RepoUrl
    $head = (& git rev-parse HEAD).Trim()
    $remoteUrl = (& git remote get-url origin).Trim()
  }
  finally {
    Pop-Location
  }

  [ordered]@{
    status = "PASS"
    repo_url = $RepoUrl
    target_dir = [System.IO.Path]::GetFullPath($TargetDir)
    branch = $Branch
    head = $head
    remote_url = $remoteUrl
    token_handle = $TokenEnvVar
    token_used = $tokenPresent
  } | ConvertTo-Json -Depth 4
}
finally {
  $env:GIT_ASKPASS = $oldAskPass
  $env:GIT_TERMINAL_PROMPT = $oldTerminalPrompt
  if (Test-Path -LiteralPath $tempDir) {
    Remove-Item -LiteralPath $tempDir -Recurse -Force
  }
}
