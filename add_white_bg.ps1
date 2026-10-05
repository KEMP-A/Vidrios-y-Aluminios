# add_white_bg.ps1 - Agregar fondo blanco a logo transparente
param(
    [string]$InputPath = "imagenes\logo.png",
    [string]$OutputPath = "imagenes\logo-white-bg.png",
    [int]$PaddingPercent = 10,
    [string]$BgColor = "white"
)

if (-not (Test-Path $InputPath)) {
    Write-Error "No se encuentra $InputPath"
    exit 1
}

Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($InputPath)
$bmp = New-Object System.Drawing.Bitmap($img)

$padW = [math]::Floor($bmp.Width * $PaddingPercent / 100)
$padH = [math]::Floor($bmp.Height * $PaddingPercent / 100)
$canvasW = $bmp.Width + 2 * $padW
$canvasH = $bmp.Height + 2 * $padH

$canvas = New-Object System.Drawing.Bitmap($canvasW, $canvasH)
$g = [System.Drawing.Graphics]::FromImage($canvas)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

if ($BgColor -eq "transparent") {
    $g.Clear([System.Drawing.Color]::Transparent)
} else {
    $g.Clear([System.Drawing.Color]::FromName($BgColor))
}

$g.DrawImage($bmp, $padW, $padH, $bmp.Width, $bmp.Height)
$canvas.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$canvas.Dispose()
$bmp.Dispose()
$img.Dispose()

Write-Host "Guardado: $OutputPath ($canvasW x $canvasH) con fondo $BgColor"