# create_favicon_v2.ps1 - Generar set completo de favicons modernos
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

# Favicons estándar
$standardSizes = @(16, 32, 48, 64, 96, 128, 192, 512)
foreach ($size in $standardSizes) {
    $resized = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($resized)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.DrawImage($bmp, 0, 0, $size, $size)
    $outputFile = Join-Path $OutputDir "favicon-$size.png"
    $resized.Save($outputFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $resized.Dispose()
    Write-Host "Generado: $outputFile"
}

# Apple touch icons
$appleSizes = @(180, 192)
foreach ($size in $appleSizes) {
    $resized = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($resized)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($bmp, 0, 0, $size, $size)
    $outputFile = Join-Path $OutputDir "apple-touch-icon-$size.png"
    $resized.Save($outputFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $resized.Dispose()
    Write-Host "Generado: $outputFile"
}

# ICO multi-resolución
$icon16 = New-Object System.Drawing.Bitmap(16, 16)
$icon32 = New-Object System.Drawing.Bitmap(32, 32)
$icon48 = New-Object System.Drawing.Bitmap(48, 48)
$g16 = [System.Drawing.Graphics]::FromImage($icon16)
$g32 = [System.Drawing.Graphics]::FromImage($icon32)
$g48 = [System.Drawing.Graphics]::FromImage($icon48)
foreach ($g in $g16, $g32, $g48) {
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
}
$g16.DrawImage($bmp, 0, 0, 16, 16)
$g32.DrawImage($bmp, 0, 0, 32, 32)
$g48.DrawImage($bmp, 0, 0, 48, 48)

# Nota: Para ICO real multi-res, se necesita librería externa
$icon32.Save((Join-Path $OutputDir "favicon.ico"), [System.Drawing.Imaging.ImageFormat]::Icon)

$g16.Dispose(); $g32.Dispose(); $g48.Dispose()
$icon16.Dispose(); $icon32.Dispose(); $icon48.Dispose()
$bmp.Dispose()
$img.Dispose()

Write-Host "Set completo de favicons generado"