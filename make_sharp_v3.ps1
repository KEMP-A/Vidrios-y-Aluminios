# make_sharp_v3.ps1 - Favicon nítido v3 optimizado para web
param(
    [string]$InputPath = "imagenes\logo.png",
    [string]$OutputDir = "imagenes\files",
    [int[]]$Sizes = @(16, 32, 48, 64, 96, 128, 192, 256, 512)
)

if (-not (Test-Path $InputPath)) {
    Write-Error "No se encuentra $InputPath"
    exit 1
}

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($InputPath)
$bmp = New-Object System.Drawing.Bitmap($img)

foreach ($size in $Sizes) {
    $resized = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($resized)
    # Bicúbico con ligero sharpening
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.DrawImage($bmp, 0, 0, $size, $size)
    
    $outputFile = Join-Path $OutputDir "favicon-v3-$size.png"
    $resized.Save($outputFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $resized.Dispose()
    Write-Host "Generado: $outputFile"
}

$bmp.Dispose()
$img.Dispose()
Write-Host "Favicons v3 generados en $OutputDir"