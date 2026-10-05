# make_transparent_max.ps1 - Logo con fondo transparente, máximo tamaño
param(
    [string]$InputPath = "imagenes\logo.png",
    [string]$OutputPath = "imagenes\logo-transparent-max.png",
    [int]$MaxSize = 512,
    [int]$PaddingPercent = 3
)

if (-not (Test-Path $InputPath)) {
    Write-Error "No se encuentra $InputPath"
    exit 1
}

Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($InputPath)
$bmp = New-Object System.Drawing.Bitmap($img)

# Calcular nuevo tamaño manteniendo aspecto
$ratio = [math]::Min($MaxSize / $bmp.Width, $MaxSize / $bmp.Height)
$newW = [math]::Floor($bmp.Width * $ratio)
$newH = [math]::Floor($bmp.Height * $ratio)

$padW = [math]::Floor($newW * $PaddingPercent / 100)
$padH = [math]::Floor($newH * $PaddingPercent / 100)
$canvasW = $newW + 2 * $padW
$canvasH = $newH + 2 * $padH

$canvas = New-Object System.Drawing.Bitmap($canvasW, $canvasH)
$g = [System.Drawing.Graphics]::FromImage($canvas)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.Clear([System.Drawing.Color]::Transparent)

$g.DrawImage($bmp, $padW, $padH, $newW, $newH)
$canvas.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$canvas.Dispose()
$bmp.Dispose()
$img.Dispose()

Write-Host "Guardado: $OutputPath ($canvasW x $canvasH)"