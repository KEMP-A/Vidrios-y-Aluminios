# crop_logo.ps1 - Recortar logo manteniendo proporción
param(
    [string]$InputPath = "imagenes\logo.png",
    [string]$OutputPath = "imagenes\logo-cropped.png",
    [int]$PaddingPercent = 3
)

if (-not (Test-Path $InputPath)) {
    Write-Error "No se encuentra $InputPath"
    exit 1
}

Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($InputPath)
$w = $img.Width
$h = $img.Height

# Detectar contenido no transparente
$bmp = New-Object System.Drawing.Bitmap($img)
$minX = $w; $maxX = 0; $minY = $h; $maxY = 0
$found = $false

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $px = $bmp.GetPixel($x, $y)
        if ($px.A -gt 0) {
            $found = $true
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

if (-not $found) {
    Write-Error "No se detectó contenido visible"
    exit 1
}

$padX = [math]::Floor(($maxX - $minX + 1) * $PaddingPercent / 100)
$padY = [math]::Floor(($maxY - $minY + 1) * $PaddingPercent / 100)
$cropX = [math]::Max(0, $minX - $padX)
$cropY = [math]::Max(0, $minY - $padY)
$cropW = [math]::Min($w - $cropX, $maxX - $minX + 1 + 2 * $padX)
$cropH = [math]::Min($h - $cropY, $maxY - $minY + 1 + 2 * $padY)

$rect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$cropped = New-Object System.Drawing.Bitmap($cropW, $cropH)
$g = [System.Drawing.Graphics]::FromImage($cropped)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($bmp, 0, 0, $rect, [System.Drawing.GraphicsUnit]::Pixel)
$cropped.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$cropped.Dispose()
$bmp.Dispose()
$img.Dispose()

Write-Host "Guardado: $OutputPath ($cropW x $cropH)"