# make_max_favicon.ps1 - Favicon máximo 512x512 con todas las variantes
param(
    [string]$InputPath = "imagenes\logo.png",
    [string]$OutputDir = "."
)

if (-not (Test-Path $InputPath)) {
    Write-Error "No se encuentra $InputPath"
    exit 1
}

Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($InputPath)
$bmp = New-Object System.Drawing.Bitmap($img)

# Generar 512x512 maestro
$masterSize = 512
$master = New-Object System.Drawing.Bitmap($masterSize, $masterSize)
$g = [System.Drawing.Graphics]::FromImage($master)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.Clear([System.Drawing.Color]::Transparent)
$g.DrawImage($bmp, 0, 0, $masterSize, $masterSize)
$master.Save((Join-Path $OutputDir "favicon-512.png"), [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Generado maestro: favicon-512.png"

# Generar tamaños derivados del maestro (mejor calidad)
$derivativeSizes = @(16, 32, 48, 64, 96, 128, 192, 256)
foreach ($size in $derivativeSizes) {
    $resized = New-Object System.Drawing.Bitmap($size, $size)
    $g2 = [System.Drawing.Graphics]::FromImage($resized)
    $g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g2.DrawImage($master, 0, 0, $size, $size)
    $outputFile = Join-Path $OutputDir "favicon-$size.png"
    $resized.Save($outputFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $g2.Dispose()
    $resized.Dispose()
    Write-Host "Generado derivado: $outputFile"
}

# Apple touch icons
$appleSizes = @(180, 192)
foreach ($size in $appleSizes) {
    $resized = New-Object System.Drawing.Bitmap($size, $size)
    $g2 = [System.Drawing.Graphics]::FromImage($resized)
    $g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g2.DrawImage($master, 0, 0, $size, $size)
    $outputFile = Join-Path $OutputDir "apple-touch-icon-$size.png"
    $resized.Save($outputFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $g2.Dispose()
    $resized.Dispose()
    Write-Host "Generado Apple: $outputFile"
}

# ICO
$icon32 = New-Object System.Drawing.Bitmap(32, 32)
$g32 = [System.Drawing.Graphics]::FromImage($icon32)
$g32.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g32.DrawImage($master, 0, 0, 32, 32)
$icon32.Save((Join-Path $OutputDir "favicon.ico"), [System.Drawing.Imaging.ImageFormat]::Icon)
$g32.Dispose()
$icon32.Dispose()

$g.Dispose()
$master.Dispose()
$bmp.Dispose()
$img.Dispose()

Write-Host "Set máximo de favicons generado"