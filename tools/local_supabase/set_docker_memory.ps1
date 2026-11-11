param([ValidateSet('8GB')][string]$Memory = '8GB')
$ErrorActionPreference = 'Stop'
$configPath = Join-Path $env:USERPROFILE '.wslconfig'
if (-not (Test-Path -LiteralPath $configPath -PathType Leaf)) {
    throw 'Existing .wslconfig was expected; no configuration was changed.'
}
$original = [System.IO.File]::ReadAllText($configPath)
if ($original -notmatch '(?m)^\[wsl2\]\s*$' -or $original -notmatch '(?m)^memory=(4GB|8GB)\s*$') {
    throw 'The observed WSL configuration changed; inspect it before applying this update.'
}
$pausedBefore = @(docker --context desktop-linux ps --filter status=paused --format '{{.Names}}')
if ($LASTEXITCODE -ne 0) { throw 'Cannot read Docker state before restart.' }
if ($original -notmatch '(?m)^memory=8GB\s*$') {
    $backupPath = Join-Path $env:TEMP ('iskra-wslconfig-before-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.ini')
    [System.IO.File]::WriteAllText($backupPath, $original, [System.Text.UTF8Encoding]::new($false))
    $updated = [regex]::Replace($original, '(?m)^memory=4GB(?=\s*$)', 'memory=8GB')
    [System.IO.File]::WriteAllText($configPath, $updated, [System.Text.UTF8Encoding]::new($false))
    Write-Output ('WSL configuration backup: ' + $backupPath)
}
# The user explicitly confirmed that restarting the Ubuntu session is acceptable.
docker desktop stop
if ($LASTEXITCODE -ne 0) { throw 'Docker Desktop did not stop; WSL was not restarted.' }
wsl --shutdown
if ($LASTEXITCODE -ne 0) { throw 'WSL shutdown failed.' }
docker desktop start
if ($LASTEXITCODE -ne 0) { throw 'Docker Desktop start failed.' }
$deadline = (Get-Date).AddSeconds(180)
do {
    $engineReady = $false
    try {
        $memoryTotal = docker --context desktop-linux info --format '{{.MemTotal}}' 2>$null
        $engineReady = $LASTEXITCODE -eq 0 -and "$memoryTotal" -match '^\d+$'
    } catch {
        # PowerShell 5.1 treats native stderr as a terminating error under Stop.
        # A missing engine pipe is expected briefly during Desktop startup.
        $memoryTotal = $null
    }
    if ($engineReady) { break }
    Start-Sleep -Seconds 2
} while ((Get-Date) -lt $deadline)
if (-not $engineReady) { throw 'Docker did not become ready within 180 seconds.' }
foreach ($containerName in $pausedBefore) {
    $pausedNow = docker --context desktop-linux inspect --format '{{.State.Paused}}' $containerName
    if ($LASTEXITCODE -ne 0) { throw 'A previously paused container could not be verified.' }
    if ($pausedNow -eq 'false') {
        docker --context desktop-linux pause $containerName
        if ($LASTEXITCODE -ne 0) { throw 'Could not preserve a previously paused container.' }
    }
}
if ([long]$memoryTotal -lt 7GB) { throw 'Docker is running, but the new memory limit is not active.' }
[pscustomobject]@{ConfiguredMemory=$Memory;DockerMemoryBytes=[long]$memoryTotal;PreservedPausedContainers=$pausedBefore.Count} | ConvertTo-Json -Compress
