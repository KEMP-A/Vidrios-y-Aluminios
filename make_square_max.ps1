# make_square_max.ps1 - Logo cuadrado con padding, máximo tamaño
param(
    [string]$InputPath = "imagenes\logo.png",
    [string]$OutputPath = "imagenes\logo-square-max.png",
    [int]$MaxSize = 512,
    [int]$PaddingPercent = 10,
    [string]$BgColor = "transparent"
)

if (-not (Test-Path $InputPath)) {
    Write-Error "No se encuentra $InputPath"
    exit 1
}

Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($InputPath)
$bmp = New-Object System.Drawing.Bitmap($img)

# Cuadrado basado en la dimensión mayor
$side = [math]::Max($bmp.Width, $bmp.Height)
$ratio = $MaxSize / $side
$newSide = [math]::Floor($side * $ratio)

$pad = [math]::Floor($newSide * $PaddingPercent / 100)
$canvasSize = $newSide + 2 * $pad

$canvas = New-Object System.Drawing.Bitmap($canvasSize, $canvasSize)
$g = [System.Drawing.Graphics]::FromImage($canvas)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

if ($BgColor -eq "transparent") {
    $g.Clear([System.Drawing.Color]::Transparent)
} else {
    $g.Clear([System.Drawing.Color]::FromName($BgColor))
}

$offsetX = [math]::Floor(($canvasSize - $newSide * $bmp.Width / $side) / 2)
$offsetY = [math]::Floor(($canvasSize - $newSide * $bmp.Height / $side) / 2)
$drawW = [math]::Floor($newSide * $bmp.Width / $side)
$drawH = [math]::Floor($newSide * $bmp.Height / $side)

$g.DrawImage($bmp, $offsetX, $offsetY, $drawW, $drawH)
$canvas.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$canvas.Dispose()
$bmp.Dispose()
$img.Dispose()

Write-Host "Guardado: $OutputPath ($canvasSize x $canvasSize)"