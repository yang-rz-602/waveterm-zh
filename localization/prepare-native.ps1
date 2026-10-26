param([string]$OriginalInstall = (Join-Path $env:LOCALAPPDATA 'Programs\waveterm'))
$ErrorActionPreference = 'Stop'
$sourceRoot = Split-Path -Parent $PSScriptRoot
$nativeRoot = Join-Path $OriginalInstall 'resources\app.asar.unpacked\dist'
foreach ($name in @('bin','schema')) {
    $source = Join-Path $nativeRoot $name
    if (!(Test-Path -LiteralPath $source -PathType Container)) { throw "Missing official component: $source" }
    Copy-Item -LiteralPath $source -Destination (Join-Path $sourceRoot 'dist') -Recurse -Force
}
Copy-Item -LiteralPath (Join-Path $OriginalInstall 'resources\tsunamiscaffold') -Destination (Join-Path $sourceRoot 'dist') -Recurse -Force
Write-Output 'Official backend, schemas and scaffold copied to the local build directory.'
