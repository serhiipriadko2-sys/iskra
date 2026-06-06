param(
  [string]$PluginRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
  [string]$ReceiptPath = ""
)

$ErrorActionPreference = "Continue"

function Run-Capture {
  param([string[]]$Command)
  try {
    $output = & $Command[0] @($Command[1..($Command.Length - 1)]) 2>&1
    return [ordered]@{
      ok = ($LASTEXITCODE -eq 0)
      exit_code = $LASTEXITCODE
      output = (($output | Out-String).Trim())
    }
  } catch {
    return [ordered]@{
      ok = $false
      exit_code = $null
      output = $_.Exception.Message
    }
  }
}

$commands = @(Get-Command codex -All -ErrorAction SilentlyContinue | ForEach-Object {
  [ordered]@{
    name = $_.Name
    path = $_.Path
    version = if ($_.FileVersionInfo) { $_.FileVersionInfo.FileVersion } else { $null }
    product = if ($_.FileVersionInfo) { $_.FileVersionInfo.Product } else { $null }
  }
})

$codexVersion = Run-Capture @("codex", "--version")
$codexMcp = Run-Capture @("codex", "mcp", "list")

$acl = $null
if ($commands.Count -gt 0 -and $commands[0].path) {
  try {
    $aclObject = Get-Acl -LiteralPath $commands[0].path
    $acl = [ordered]@{
      owner = $aclObject.Owner
      group = $aclObject.Group
      sddl = $aclObject.Sddl
    }
  } catch {
    $acl = [ordered]@{ error = $_.Exception.Message }
  }
}

$configPath = Join-Path $env:USERPROFILE ".codex\config.toml"
$configText = if (Test-Path -LiteralPath $configPath) { Get-Content -LiteralPath $configPath -Raw } else { "" }
$pluginJson = Join-Path $PluginRoot ".codex-plugin\plugin.json"
$skillFile = Join-Path $PluginRoot "skills\iskra-toolchain-bridge\SKILL.md"

$receipt = [ordered]@{
  status = if ($codexVersion.ok) { "codex-cli-callable" } else { "config-exposed-cli-blocked" }
  generated_at = (Get-Date).ToString("o")
  plugin_root = (Resolve-Path $PluginRoot).Path
  plugin_manifest_present = (Test-Path -LiteralPath $pluginJson)
  skill_present = (Test-Path -LiteralPath $skillFile)
  codex_commands = $commands
  codex_version = $codexVersion
  codex_mcp_list = $codexMcp
  codex_acl = $acl
  config_path = $configPath
  config_marketplace_exposed = ($configText -match "\[marketplaces\.iskra-local\]")
  config_plugin_enabled = ($configText -match '\[plugins\."iskra-toolchain-bridge@iskra-local"\]')
  boundary = "Config exposure does not prove the running Codex app loaded the plugin until the app/CLI reports it."
}

$json = $receipt | ConvertTo-Json -Depth 8
if ($ReceiptPath) {
  $parent = Split-Path -Parent $ReceiptPath
  if ($parent) { New-Item -ItemType Directory -Force -Path $parent | Out-Null }
  Set-Content -LiteralPath $ReceiptPath -Value $json -Encoding utf8
}

$json
